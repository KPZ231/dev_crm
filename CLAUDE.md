# Plan: Implement Variable System in WYSIWYG Editor

**Goal:** To create a functional system that allows the document editor to display and utilize dynamically available variables (data variables), moving beyond relying only on static data content.

**Context:** The current architecture shows document content management is centralized around the `WYSIWYGEditor.tsx` component and handled by actions in `lib/actions/`. The current system only manages static data.

**Affected Files (Initial Estimate):**
*   `app/components/documents/WYSIWYGEditor.tsx` (Primary modification)
*   `lib/types/document.ts` (To define variable structures)
*   `lib/schemas/document.ts` (To validate variables)
*   `lib/actions/documents.ts` (To load/process variable context)

### Phase 1: Define Variable Contract (Data Layer)

1.  **New Type Definition:** Create a type or interface in `lib/types/document.ts` (or a new file if necessary) to model an available variable. This should include a unique `key`, a `display_name`, and possibly a fallback `default_value`.
2.  **Schema Validation:** Update or create a schema in `lib/schemas/document.ts` to include validation for an array of these variables, ensuring data integrity before processing.

### Phase 2: Update Business Logic (Action Layer)

1.  **Context Retrieval:** In `lib/actions/documents.ts`, update the function responsible for fetching/initializing a document. This function must now fetch or accept a list of `availableVariables` alongside the primary document content.
2.  **Data Passing:** Ensure the `availableVariables` list is passed as a prop or context object to the `WYSIWYGEditor.tsx` component when initializing the editor.

### Phase 3: Implement Editor Rendering (UI Layer)

1.  **State Management:** Update `WYSIWYGEditor.tsx` to accept the `availableVariables` context.
2.  **Placeholder Detection:** Modify the rendering logic to detect specific placeholder patterns (e.g., `{{variable_key}}`).
3.  **Substitution:** When a placeholder is detected, the component must look up the corresponding value in the `availableVariables` list provided via props and replace the placeholder with the actual display value.
4.  **Input Handling:** The component must also handle input changes to prevent the substitution from breaking during active editing, potentially by converting user input back into placeholders if necessary, or simply restricting direct editability of variable fields.

### Testing & Verification
After implementation, the following tests must be run:
1.  Integration test demonstrating the successful rendering and substitution of a variable placeholder in the editor.
2.  Unit test confirming that the data passed to the editor contains the required variable context.

This plan adheres to the separation of concerns: data definition in `lib/types/`, validation in `lib/schemas/`, orchestration in `lib/actions/`, and presentation in `components/`.