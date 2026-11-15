-- =====================================================================
-- EASYVIDEO CHANGE STUDIO — DEMO SEED DATA (Northstar Technologies)
-- =====================================================================

-- 1. Create Northstar Organization
INSERT INTO organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Northstar Technologies', 'northstar-people')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Demo User
INSERT INTO users (id, email, full_name, avatar_url)
VALUES ('00000000-0000-0000-0000-000000000002', 'kabir@northstar.internal', 'Kabir Khurana', 'KK')
ON CONFLICT (id) DO NOTHING;

-- 3. Add Member
INSERT INTO organization_members (organization_id, user_id, role)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'admin')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 4. Create Project
INSERT INTO projects (
    id, organization_id, title, description, category, current_version,
    status, duration, scene_count, language_count
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Remote Work Essentials',
    'Employee onboarding · Owned by People & Culture',
    'Policy & Operations',
    '1.0',
    'in_review',
    '04:32',
    12,
    4
) ON CONFLICT (id) DO NOTHING;

-- 5. Add Source Document
INSERT INTO source_documents (
    id, project_id, name, meta, version_label, file_size, file_type, is_active
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    'Remote_Work_Policy_v2.pdf',
    'PDF document · 2.4 MB',
    'Policy v2 · Nov 12',
    2450000,
    'application/pdf',
    true
) ON CONFLICT (id) DO NOTHING;
