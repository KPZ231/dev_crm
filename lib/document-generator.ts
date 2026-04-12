export interface DocumentData {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  nip?: string;
  date?: string;
  documentName?: string;
  [key: string]: any;
}

/**
 * Replaces variables in a template string with actual data.
 * Template format: {{variableName}}
 */
export function fillTemplate(template: string, data: DocumentData): string {
  let result = template;
  
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value?.toString() || "");
  }
  
  // Clean up any remaining tags
  result = result.replace(/{{[a-zA-Z0-9_]+}}/g, "");
  
  return result;
}

/**
 * Standard templates for document types if no custom template is provided.
 */
export const DEFAULT_TEMPLATES: Record<string, string> = {
  OFFER: `
# OFERTA WSPÓŁPRACY
Dla: {{companyName}}
Odwiedzamy: {{contactPerson}}

Szanowni Państwo,
Przesyłamy ofertę na realizację usług...
...
Z poważaniem,
DevCRM Team
  `,
  CONTRACT: `
# UMOWA NR {{documentName}}
Zawarta dnia {{date}} pomiędzy:
DevCRM Workspace a {{companyName}}, NIP: {{nip}}
...
  `,
  // ... other types
};
