'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Button, Field, Input } from '@/components/ui';
import type { MappePerson } from '@/lib/mappe/editor';
import { MAPPE_LIMITS } from '@/lib/mappe/options';
import { EditorSection } from './EditorSection';

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface PersonalSectionProps {
  step: number;
  person: MappePerson;
  onChange: (patch: Partial<MappePerson>) => void;
  photoUrl: string | null;
  onPhotoChange: (file: File | null) => void;
}

export function PersonalSection({ step, person, onChange, photoUrl, onPhotoChange }: PersonalSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      setPhotoError('Bitte wähl ein Foto im Format JPG, PNG oder WebP.');
      return;
    }
    setPhotoError(null);
    onPhotoChange(file);
  }

  return (
    <EditorSection
      id="mappe-persoenliches"
      step={step}
      title="Persönliches"
      description="Steht oben auf Anschreiben und Lebenslauf. Telefon, E-Mail, Wohnort und Foto werden nicht mitgesendet."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Vor- und Nachname" className="sm:col-span-2">
          <Input
            name="name"
            autoComplete="name"
            maxLength={MAPPE_LIMITS.name}
            value={person.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </Field>
        <Field label="Telefon">
          <Input
            name="tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={MAPPE_LIMITS.phone}
            value={person.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </Field>
        <Field label="E-Mail" optional>
          <Input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            maxLength={MAPPE_LIMITS.email}
            value={person.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </Field>
        <Field label="Wohnort" hint="Postleitzahl und Ort" className="sm:col-span-2">
          <Input
            name="wohnort"
            autoComplete="address-level2"
            maxLength={MAPPE_LIMITS.location}
            value={person.location}
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-callout font-medium text-ink">
          Foto <span className="font-normal text-ink-muted">(optional)</span>
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL, never uploaded
            <img src={photoUrl} alt="Dein Bewerbungsfoto" className="h-20 w-16 rounded-xs object-cover" />
          )}
          <input
            ref={fileRef}
            type="file"
            accept={PHOTO_TYPES.join(',')}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleFile}
          />
          <Button
            variant="outline"
            aria-describedby="mappe-foto-hint"
            onClick={() => fileRef.current?.click()}
          >
            <Camera aria-hidden="true" strokeWidth={1.75} className="size-5" />
            {photoUrl ? 'Foto ändern' : 'Foto hinzufügen'}
          </Button>
          {photoUrl && (
            <Button variant="ghost" onClick={() => onPhotoChange(null)}>
              <Trash2 aria-hidden="true" strokeWidth={1.75} className="size-5" />
              Foto entfernen
            </Button>
          )}
        </div>
        <p id="mappe-foto-hint" className="text-footnote text-ink-muted">
          Das Foto bleibt auf deinem Gerät. Es wird weder gespeichert noch gesendet und ist nach dem Neuladen weg.
        </p>
        {photoError && (
          <p role="alert" className="text-footnote font-medium text-danger">
            {photoError}
          </p>
        )}
      </div>
    </EditorSection>
  );
}
