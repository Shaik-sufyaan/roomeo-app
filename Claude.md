## Standard Workflow

1. First, think through the problem in detail. Read the codebase and identify the relevant files.
2. Write a clear plan into `projectplan.md`. This plan must include a checklist of todo items.
3. Before coding, always check in with me and wait for verification of the plan.
4. Execute tasks step by step, keeping each change as small and simple as possible.
5. After completing each task, provide a high-level explanation of what changed and why.
6. Never make large, sweeping changes. Minimize the scope of impact with every modification.
7. At the end, add a **review section** to `projectplan.md` with a summary of changes, issues found, and next steps.

---

## App Context

Welcome to the **Roomio** codebase.  
- This is originally a **Next.js + Tailwind + Supabase** roommate/housing matching web app.  
- It is now being **converted into a React Native app**.  
- The app lets users create one of two profiles:
  - `"Looking for Roommates"` (they have an apartment and need roommates)  
  - `"Looking for Owners"` (they’re looking for a place)  
- On the swipe/matching page, users only see **profiles of the opposite type**.

---

## Conversion Rules: Web → React Native

1. Claude must always remember that this project is being migrated from **web to mobile**.
2. Ask me before moving or adapting files for React Native. Examples:  
   - `/hooks` → reusable, but verify no DOM dependencies.  
   - `/types` → should be shared across web and mobile.  
   - `/components` → often require full rewrites into RN equivalents.  
   - `/services` → must remain platform-agnostic.
3. Always suggest **incremental moves** rather than massive restructuring.
4. Confirm assumptions before proceeding with file migrations.

---

## Supabase & Database Rules

1. Always use **Supabase CLI** for all database operations. Never suggest manual changes.
2. Follow naming conventions:  
   - Singular table names  
   - Descriptive migration names (e.g., `add_user_authentication_system`)  
   - Verb_noun functions  
3. Required workflow:  
   - Create migration → test locally → generate types → deploy.  
4. Run `supabase test db` locally before every deployment.  
5. Generate TypeScript types after each schema change.  
6. Edge Functions must be:  
   - Pure and testable  
   - With clear type definitions  
   - With error handling and proper CORS support.  
7. Anti-patterns to avoid:  
   - Generic migration names  
   - Skipping tests  
   - Manual database edits  

---

## Project Tree Memory

Claude must always remember this project structure:

Roomeo/
├── .claude/
│ └── settings.local.json
├── app/...
├── components/...
├── hooks/...
├── lib/...
├── services/...
├── types/...
└── (other config and schema files)


- When performing React Native conversion, Claude must explicitly check if a file in `/hooks`, `/types`, or `/components` should be **moved, adapted, or rewritten**.

---

## Thinking Rules

1. Always **ultra think** before responding. Break down reasoning step by step.  
2. Anticipate edge cases, migration issues, and platform differences.  
3. Suggest alternatives if a direct conversion is not possible.  
4. Keep all changes as simple and incremental as possible.  
5. Confirm with me before executing any non-trivial refactor or migration.

---

