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
export function fillTemplate(template: any, data: DocumentData): string {
  if (!template) return "";
  let result = typeof template === 'string' ? template : (template.html || JSON.stringify(template));
  
  // Add common dynamic variables if not present
  const enrichedData = {
    date: new Date().toLocaleDateString('pl-PL'),
    ...data
  };
  
  // Replace variables from data
  for (const [key, value] of Object.entries(enrichedData)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    const replacement = value !== undefined && value !== null ? value.toString() : "";
    result = result.replace(regex, replacement);
  }
  
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
