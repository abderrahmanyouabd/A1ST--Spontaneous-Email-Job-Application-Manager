import { Task } from './types';
import fs from 'fs';
import path from 'path';

// Function to read templates from templates.json
const readTemplates = () => {
  try {
    const templatesFilePath = path.join(process.cwd(), 'public', 'templates.json');
    if (fs.existsSync(templatesFilePath)) {
      const data = fs.readFileSync(templatesFilePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Error reading templates:", error);
    return null;
  }
};

export function generateJobInquiryEmail(task: Task) {
  const { companyName, contactPerson, position, location, companyWebsite } = task;
  
  // Try to load custom templates first
  const customTemplates = readTemplates();
  
  if (customTemplates && customTemplates.subject && customTemplates.body) {
    // Use custom templates with variable replacement
    let subject = customTemplates.subject;
    let body = customTemplates.body;
    
    // Replace variables in subject and body
    const variables = {
      companyName: companyName || '',
      contactPerson: contactPerson || '',
      position: position || '',
      location: location || '',
      companyWebsite: companyWebsite || ''
    };
    
    Object.entries(variables).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    return { subject, body };
  }
  
  // Fall back to default templates if custom ones aren't available
  const greeting = contactPerson ? `Bonjour ${contactPerson},` : 'Bonjour,';
  
  const subject = `Candidature spontanée - ${position || 'Alternance/Stage'} - ${companyName}`;
  
  // Choose a template based on the position type
  let template = '';
  
  if (position && position.toLowerCase().includes('alternance')) {
    // Template for internship/alternance
    template = `
${greeting}

Je me permets de vous contacter car je suis actuellement à la recherche d'une alternance ${position.includes('Data') ? 'dans le domaine de la data science' : 'en développement informatique'} ${location ? `à ${location}` : ""}.

Étudiant en Master Informatique à l'Université de Paris, je suis particulièrement intéressé par les activités de ${companyName} ${companyWebsite ? `que j'ai pu découvrir sur votre site ${companyWebsite}` : ""}.

Mon parcours académique m'a permis d'acquérir de solides compétences en programmation, analyse de données et développement web, que je souhaiterais mettre à profit au sein de votre entreprise.

Je serais ravi de pouvoir échanger avec vous concernant les possibilités d'alternance au sein de ${companyName}. Vous trouverez en pièce jointe mon CV détaillant mon parcours et mes compétences.

Disponible pour un entretien à votre convenance, je reste à votre disposition pour toute information complémentaire.

Je vous remercie par avance pour l'attention que vous porterez à ma candidature et vous prie d'agréer, ${contactPerson ? '' : 'Madame, Monsieur,'} l'expression de mes salutations distinguées.

[Votre Nom]
[Votre Email]
[Votre Téléphone]`;
  } else {
    // Template for full-time positions
    template = `
${greeting}

Je me permets de vous contacter suite à ma recherche d'opportunités professionnelles dans le domaine ${position ? `du ${position}` : "du développement informatique"} ${location ? `à ${location}` : ""}.

Diplômé d'un Master en Informatique et fort d'une expérience de 3 ans dans le développement d'applications web, je suis particulièrement intéressé par les projets innovants menés par ${companyName} ${companyWebsite ? `que j'ai pu découvrir sur votre site ${companyWebsite}` : ""}.

Mes compétences techniques incluent la maîtrise de plusieurs langages de programmation (JavaScript, Python, Java), des frameworks modernes (React, Node.js), ainsi qu'une solide expérience en gestion de projets agiles.

Je serais ravi de pouvoir mettre mes compétences au service de votre entreprise et de contribuer à vos projets ambitieux. Vous trouverez en pièce jointe mon CV détaillant mon parcours professionnel.

Disponible pour un entretien à votre convenance, je reste à votre disposition pour toute information complémentaire.

Je vous remercie par avance pour l'attention que vous porterez à ma candidature et vous prie d'agréer, ${contactPerson ? '' : 'Madame, Monsieur,'} l'expression de mes salutations distinguées.

[Votre Nom]
[Votre Email]
[Votre Téléphone]`;
  }
  
  return {
    subject,
    body: template
  };
} 