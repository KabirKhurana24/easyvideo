-- =====================================================================
-- EASYVIDEO CHANGE STUDIO — PRODUCTION DATABASE SCHEMA
-- Multi-tenant architecture with Supabase PostgreSQL, RLS, and Auth
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Users (extending auth.users metadata)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Organization Members (RBAC: admin, editor, reviewer)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'reviewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 4. Projects (Training Videos)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'General',
    current_version VARCHAR(50) NOT NULL DEFAULT '1.0',
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'ready_to_publish', 'published')),
    thumbnail_url TEXT,
    duration VARCHAR(50) DEFAULT '00:00',
    scene_count INT NOT NULL DEFAULT 0,
    language_count INT NOT NULL DEFAULT 1,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Source Documents
CREATE TABLE IF NOT EXISTS source_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    meta VARCHAR(255),
    version_label VARCHAR(100) NOT NULL DEFAULT 'v1.0',
    file_size BIGINT NOT NULL DEFAULT 0,
    file_type VARCHAR(100) NOT NULL,
    storage_path TEXT,
    extracted_text TEXT,
    sections JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Scenes
CREATE TABLE IF NOT EXISTS scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scene_number VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    area VARCHAR(100),
    headline TEXT NOT NULL,
    script TEXT NOT NULL,
    visual_description TEXT,
    duration_seconds INT NOT NULL DEFAULT 20,
    order_index INT NOT NULL DEFAULT 1,
    source_ref VARCHAR(255),
    source_quote TEXT,
    is_affected BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'unchanged' CHECK (status IN ('unchanged', 'pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Scene Versions (Historical snapshots per version)
CREATE TABLE IF NOT EXISTS scene_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    project_version VARCHAR(50) NOT NULL,
    headline TEXT NOT NULL,
    script TEXT NOT NULL,
    visual_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Detected Changes (AI Comparison Results)
CREATE TABLE IF NOT EXISTS detected_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scene_id INT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'policy_change', 'numerical_change', 'process_change',
        'terminology_change', 'content_addition', 'content_removal', 'no_material_change'
    )),
    area VARCHAR(100) NOT NULL,
    impact VARCHAR(50) NOT NULL,
    impact_class VARCHAR(20) NOT NULL CHECK (impact_class IN ('high', 'medium', 'low')),
    summary TEXT NOT NULL,
    previous_info TEXT NOT NULL,
    updated_info TEXT NOT NULL,
    old_headline TEXT NOT NULL,
    new_headline TEXT NOT NULL,
    old_text TEXT NOT NULL,
    new_text TEXT NOT NULL,
    original_doc_ref VARCHAR(255),
    updated_doc_ref VARCHAR(255),
    source VARCHAR(255) NOT NULL,
    source_quote TEXT NOT NULL,
    affected_scene_ids INT[] NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
    confidence_score NUMERIC(4, 3) NOT NULL,
    recommended_action TEXT NOT NULL,
    suggested_narration TEXT NOT NULL,
    suggested_headline TEXT NOT NULL,
    suggested_visual TEXT,
    explanation TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    user_headline TEXT,
    user_script TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Change Decisions (Audit log of user approvals/rejections)
CREATE TABLE IF NOT EXISTS change_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detected_change_id UUID NOT NULL REFERENCES detected_changes(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('pending', 'accepted', 'rejected')),
    edited_headline TEXT,
    edited_script TEXT,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Scene Translations
CREATE TABLE IF NOT EXISTS scene_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scene_id INT NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    language_name VARCHAR(100) NOT NULL,
    locale VARCHAR(100) NOT NULL,
    headline TEXT NOT NULL,
    narration TEXT NOT NULL,
    note TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'review' CHECK (status IN ('review', 'approved')),
    warnings JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, scene_id, language_code)
);

-- 11. Localization Reviews (Language-level approval states)
CREATE TABLE IF NOT EXISTS localization_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'review' CHECK (status IN ('review', 'approved')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    UNIQUE(project_id, language_code)
);

-- 12. Published Versions (Full snapshots for audit and rollback)
CREATE TABLE IF NOT EXISTS published_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(255) NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, version)
);

-- 13. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id VARCHAR(255),
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    is_ai BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Generation Jobs
CREATE TABLE IF NOT EXISTS generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('scene_script', 'tts_audio', 'video_render', 'localization')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    progress INT NOT NULL DEFAULT 0,
    input_payload JSONB DEFAULT '{}'::jsonb,
    output_payload JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_scenes_project ON scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_detected_changes_project ON detected_changes(project_id);
CREATE INDEX IF NOT EXISTS idx_translations_proj_lang ON scene_translations(project_id, language_code);
CREATE INDEX IF NOT EXISTS idx_audit_project ON audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_published_project ON published_versions(project_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE localization_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

-- Sample RLS Policy: Users can only view/modify data within organizations they belong to
CREATE POLICY org_member_isolation_policy ON projects
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );
