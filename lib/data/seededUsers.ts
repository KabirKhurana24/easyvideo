import { User, Organization } from "@/types";

export interface DemoUser extends User {
  passwordHint?: string;
  description: string;
}

export const DUMMY_ORGANIZATIONS: Organization[] = [
  {
    id: "org_northstar",
    name: "Northstar Technologies",
    slug: "northstar-people",
    workspaceName: "Northstar People",
    logoUrl: "N",
    createdAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "org_acme",
    name: "Acme Global Enterprise",
    slug: "acme-learning",
    workspaceName: "Acme Learning Ops",
    logoUrl: "A",
    createdAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "org_techcorp",
    name: "TechCorp Global Operations",
    slug: "techcorp-ops",
    workspaceName: "Product Enablement",
    logoUrl: "T",
    createdAt: "2026-05-10T00:00:00Z",
  },
];

export const DUMMY_USERS: DemoUser[] = [
  {
    id: "user_kabir",
    email: "kabir@northstar.internal",
    fullName: "Kabir Khurana",
    role: "admin",
    avatarUrl: "KK",
    title: "Head of Learning & Enablement",
    department: "People & Culture",
    organizationId: "org_northstar",
    description: "Full administration, scene approvals, publishing releases & system rollbacks.",
  },
  {
    id: "user_sarah",
    email: "sarah.lin@northstar.internal",
    fullName: "Sarah Lin",
    role: "editor",
    avatarUrl: "SL",
    title: "Senior Instructional Designer",
    department: "Learning Production",
    organizationId: "org_northstar",
    description: "Script editing, storyboard prompt adjustments & AI preview regeneration.",
  },
  {
    id: "user_elena",
    email: "elena.r@northstar.internal",
    fullName: "Elena Rostova",
    role: "reviewer",
    avatarUrl: "ER",
    title: "Global Localization Lead",
    department: "Global Operations",
    organizationId: "org_northstar",
    description: "Multilingual verification, glossary adherence & language QA approvals.",
  },
  {
    id: "user_marcus",
    email: "marcus.v@northstar.internal",
    fullName: "Marcus Vance",
    role: "reviewer",
    avatarUrl: "MV",
    title: "Senior People Partner",
    department: "People & Culture",
    organizationId: "org_northstar",
    description: "Policy grounding verification, employee handbook compliance & HR signoff.",
  },
];
