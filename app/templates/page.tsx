"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Mail, Save } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function TemplatesPage() {
  const [template, setTemplate] = useState({
    subject: "Candidature spontanée - {{position}} - {{companyName}}",
    body: `Bonjour {{contactPerson}},

Je me permets de vous contacter car je suis actuellement à la recherche d'une alternance {{position}} {{location}}.

Étudiant en Master Informatique à l'Université de Paris, je suis particulièrement intéressé par les activités de {{companyName}} {{companyWebsite}}.

Mon parcours académique m'a permis d'acquérir de solides compétences en programmation, analyse de données et développement web, que je souhaiterais mettre à profit au sein de votre entreprise.

Je serais ravi de pouvoir échanger avec vous concernant les possibilités d'alternance au sein de {{companyName}}. Vous trouverez en pièce jointe mon CV détaillant mon parcours et mes compétences.

Disponible pour un entretien à votre convenance, je reste à votre disposition pour toute information complémentaire.

Je vous remercie par avance pour l'attention que vous porterez à ma candidature et vous prie d'agréer l'expression de mes salutations distinguées.

[Votre Nom]
[Votre Email]
[Votre Téléphone]`,
  })

  const updateTemplate = (field: string, value: string) => {
    setTemplate({
      ...template,
      [field]: value,
    })
  }

  const [previewData] = useState({
    companyName: "TechVision",
    companyWebsite: "que j'ai pu découvrir sur votre site www.techvision.fr",
    contactPerson: "Mme. Dubois",
    position: "en développement web",
    location: "à Paris",
  })

  const renderPreview = (template: string) => {
    let preview = template

    Object.entries(previewData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, "g"), value)
    })

    return preview
  }

  const handleSaveTemplate = async () => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save template');
      }
      
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Modèle d'Email pour Alternance</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Modifier le Modèle</CardTitle>
            <CardDescription>Personnalisez votre modèle de candidature spontanée</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Objet de l'Email</Label>
                <Input
                  id="subject"
                  value={template.subject}
                  onChange={(e) => updateTemplate("subject", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Corps de l'Email</Label>
                <Textarea
                  id="body"
                  rows={15}
                  value={template.body}
                  onChange={(e) => updateTemplate("body", e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aperçu</CardTitle>
            <CardDescription>Visualisation de votre email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Aperçu de l'Email
              </h3>

              <div className="border rounded-md p-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Objet:</p>
                  <p className="text-sm bg-muted p-2 rounded">{renderPreview(template.subject)}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Corps:</p>
                  <div className="text-sm bg-muted p-2 rounded whitespace-pre-wrap">
                    {renderPreview(template.body)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Variables Disponibles</h3>
              <div className="text-sm space-y-1">
                <p>
                  <code>
                    {`{{`}companyName{`}}`}
                  </code>{" "}
                  - Nom de l'entreprise
                </p>
                <p>
                  <code>
                    {`{{`}companyWebsite{`}}`}
                  </code>{" "}
                  - Site web de l'entreprise
                </p>
                <p>
                  <code>
                    {`{{`}contactPerson{`}}`}
                  </code>{" "}
                  - Nom du contact
                </p>
                <p>
                  <code>
                    {`{{`}position{`}}`}
                  </code>{" "}
                  - Poste recherché
                </p>
                <p>
                  <code>
                    {`{{`}location{`}}`}
                  </code>{" "}
                  - Localisation
                </p>
              </div>
            </div>

            <Button className="w-full" onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder le Modèle
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

