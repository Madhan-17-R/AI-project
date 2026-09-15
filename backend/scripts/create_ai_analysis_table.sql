-- =============================================================================
-- Migration: Create ai_analysis table for Gemini AI Integration
-- =============================================================================

-- Create the ai_analysis table linked to the existing anomalies table
CREATE TABLE IF NOT EXISTS public.ai_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL,
    model TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_explanation TEXT NOT NULL,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence INTEGER NOT NULL,
    uncertainty TEXT,
    language TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    
    -- Ensure idempotency so we don't store multiple analyses per event
    CONSTRAINT ai_analysis_event_id_key UNIQUE (event_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read analysis
CREATE POLICY "Allow authenticated read access" ON public.ai_analysis
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow service role to insert/update analysis
CREATE POLICY "Allow service role full access" ON public.ai_analysis
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create index for fast lookups by event_id
CREATE INDEX IF NOT EXISTS idx_ai_analysis_event_id ON public.ai_analysis(event_id);
