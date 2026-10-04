-- ============================================================================
-- RETRIVO: Campus Lost & Found Supabase Schema
-- Includes pgvector multimodal similarity indexing and zero-trust RLS policies
-- ============================================================================

-- 1. Enable pgvector extension for AI embeddings (CLIP & Text embeddings)
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. User Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    phone_number TEXT,
    department TEXT,
    trust_score INT DEFAULT 95 CHECK (trust_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Campus Items (Lost & Found reports)
CREATE TABLE IF NOT EXISTS public.campus_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'electronics', 'identification', 'keys', 'wallets_bags', 
        'clothing', 'stationery_books', 'accessories', 'other'
    )),
    building TEXT NOT NULL,
    floor_or_room TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    image_url TEXT,
    -- CRITICAL: Hidden ownership verification detail (Secret Anchor)
    hidden_clue TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_verification', 'returned')),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Multimodal AI Embeddings
    text_embedding vector(1536), -- text-embedding-3-small
    image_embedding vector(512),  -- CLIP ViT-B/32 image vector
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Match Results (Continuous AI Multimodal Pairing)
CREATE TABLE IF NOT EXISTS public.match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_item_id UUID NOT NULL REFERENCES public.campus_items(id) ON DELETE CASCADE,
    found_item_id UUID NOT NULL REFERENCES public.campus_items(id) ON DELETE CASCADE,
    match_score NUMERIC(4,2) NOT NULL CHECK (match_score BETWEEN 0.0 AND 10.0),
    text_score NUMERIC(4,3) NOT NULL,
    image_score NUMERIC(4,3) NOT NULL,
    location_score NUMERIC(4,3) NOT NULL,
    time_score NUMERIC(4,3) NOT NULL,
    recommended_action TEXT DEFAULT 'manual_review',
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lost_item_id, found_item_id)
);

-- 5. Claim Verifications & Secure Handover PIN
CREATE TABLE IF NOT EXISTS public.claim_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.campus_items(id) ON DELETE CASCADE,
    claimant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    proof_answer TEXT NOT NULL, -- Claimant's answer attempting to match hidden_clue
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    handover_code TEXT, -- 6-digit One-Time Handover PIN (e.g. '849-216')
    handover_confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECURITY POLICIES (Row-Level Security)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can view campus profiles
CREATE POLICY "Public profiles are readable by campus members"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Items: Public view excludes `hidden_clue` unless user is the reporter
-- We accomplish zero-trust through a secure view:
CREATE OR REPLACE VIEW public.public_campus_items AS
SELECT
    id,
    type,
    title,
    description,
    category,
    building,
    floor_or_room,
    latitude,
    longitude,
    timestamp,
    image_url,
    status,
    user_id,
    created_at,
    -- Redact hidden_clue for non-owners:
    CASE 
        WHEN auth.uid() = user_id THEN hidden_clue 
        ELSE 'REDACTED_BY_RETRIVO' 
    END AS hidden_clue
FROM public.campus_items;

-- Claims: Claimant and Reporter can view and update their respective claims
CREATE POLICY "Claimants and Reporters can view claims"
ON public.claim_verifications FOR SELECT
TO authenticated
USING (
    auth.uid() = claimant_id OR 
    auth.uid() IN (SELECT user_id FROM public.campus_items WHERE id = item_id)
);

-- ============================================================================
-- MULTIMODAL SIMILARITY RPC FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.search_multimodal_matches(
    target_item_id UUID,
    similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
    candidate_id UUID,
    composite_score FLOAT,
    text_sim FLOAT,
    image_sim FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_type TEXT;
    target_text_emb vector(1536);
    target_img_emb vector(512);
BEGIN
    SELECT type, text_embedding, image_embedding 
    INTO target_type, target_text_emb, target_img_emb
    FROM public.campus_items 
    WHERE id = target_item_id;

    RETURN QUERY
    SELECT 
        c.id AS candidate_id,
        (
            (1 - (c.text_embedding <=> target_text_emb)) * 0.45 +
            (1 - (c.image_embedding <=> target_img_emb)) * 0.55
        )::FLOAT AS composite_score,
        (1 - (c.text_embedding <=> target_text_emb))::FLOAT AS text_sim,
        (1 - (c.image_embedding <=> target_img_emb))::FLOAT AS image_sim
    FROM public.campus_items c
    WHERE c.type != target_type
      AND c.status = 'open'
    ORDER BY composite_score DESC
    LIMIT 20;
END;
$$;
