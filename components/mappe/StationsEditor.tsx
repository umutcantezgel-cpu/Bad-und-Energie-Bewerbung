'use client';

import { useEffect, useRef } from 'react';
import { Icon } from '@/components/icons';
import { Button, Field, IconButton, Input, Textarea, useToast } from '@/components/ui';
import type { ListAction } from '@/lib/mappe/stations';
import { cn } from '@/lib/utils/cn';

export interface StationField<T> {
  key: Exclude<keyof T, 'id'> & string;
  label: string;
  optional?: boolean;
  hint?: string;
  placeholder?: string;
  maxLength: number;
  multiline?: boolean;
  /** Half width from `sm`. */
  half?: boolean;
  /** Message below the field for the current value, e.g. when lines will be cut. */
  check?: (value: string) => string | undefined;
}

export interface StationsEditorProps<T extends { id: string }> {
  /** id of the visible h3 that names the list. */
  titleId: string;
  title: string;
  items: readonly T[];
  fields: readonly StationField<T>[];
  max: number;
  createItem: () => T;
  isEmpty: (item: T) => boolean;
  addLabel: string;
  emptyText: string;
  onAction: (action: ListAction<T>) => void;
  /** Polite screen reader message (shared live region). */
  announce: (message: string) => void;
}

type FocusTarget = { id: string; target: 'first' | 'up' | 'down' } | 'add';

interface CardRefs {
  first: HTMLInputElement | HTMLTextAreaElement | null;
  up: HTMLButtonElement | null;
  down: HTMLButtonElement | null;
}

/**
 * Add, edit, remove and reorder Lebenslauf entries. Reordering uses buttons
 * (keyboard and screen reader friendly); focus follows the moved entry.
 */
export function StationsEditor<T extends { id: string }>({
  titleId,
  title,
  items,
  fields,
  max,
  createItem,
  isEmpty,
  addLabel,
  emptyText,
  onAction,
  announce,
}: StationsEditorProps<T>) {
  const { toast } = useToast();
  const cardRefs = useRef(new Map<string, CardRefs>());
  const addRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<FocusTarget | null>(null);

  useEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    pendingFocus.current = null;
    if (pending === 'add') {
      addRef.current?.focus();
      return;
    }
    const refs = cardRefs.current.get(pending.id);
    if (!refs) return;
    if (pending.target === 'first') {
      refs.first?.focus();
      return;
    }
    const preferred = refs[pending.target];
    const other = refs[pending.target === 'up' ? 'down' : 'up'];
    (preferred && !preferred.disabled ? preferred : other)?.focus();
  }, [items]);

  // Called from ref callbacks (commit phase), never during render.
  function setCardRef<K extends keyof CardRefs>(id: string, key: K, node: CardRefs[K]) {
    const refs = cardRefs.current.get(id) ?? { first: null, up: null, down: null };
    refs[key] = node;
    cardRefs.current.set(id, refs);
  }

  function add() {
    const item = createItem();
    onAction({ type: 'add', item, max });
    pendingFocus.current = { id: item.id, target: 'first' };
    announce(`Eintrag ${items.length + 1} hinzugefügt.`);
  }

  function move(item: T, index: number, direction: -1 | 1) {
    onAction({ type: 'move', id: item.id, direction });
    pendingFocus.current = { id: item.id, target: direction < 0 ? 'up' : 'down' };
    announce(`Eintrag ${index + 1} ist jetzt Eintrag ${index + 1 + direction}.`);
  }

  function remove(item: T, index: number) {
    onAction({ type: 'remove', id: item.id });
    cardRefs.current.delete(item.id);
    pendingFocus.current = 'add';
    if (isEmpty(item)) {
      announce(`Eintrag ${index + 1} entfernt.`);
      return;
    }
    toast({
      title: `Eintrag ${index + 1} entfernt`,
      action: { label: 'Rückgängig', onClick: () => onAction({ type: 'add', item, max, index }) },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 id={titleId} className="text-body font-bold text-ink">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="text-callout text-ink-2">{emptyText}</p>
      ) : (
        <ol aria-labelledby={titleId} className="flex flex-col gap-4">
          {items.map((item, index) => {
            const n = index + 1;
            return (
              <li key={item.id} className="flex flex-col gap-5 rounded-2 bg-surface-2 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-etikett text-ink-2">
                    Eintrag <span className="font-mass">{n}</span>
                  </h4>
                  {/* Bedienleiste: Der Sprung aus der Checkliste landet im ersten Feld, nicht hier (SPRUNG_NEIN in stand.ts). */}
                  <div className="-mr-2 flex shrink-0 items-center" data-sprung-nein="">
                    <IconButton
                      ref={(node) => setCardRef(item.id, 'up', node)}
                      aria-label={`Eintrag ${n} nach oben verschieben`}
                      disabled={index === 0}
                      onClick={() => move(item, index, -1)}
                    >
                      <Icon name="arrow-up" size="md" />
                    </IconButton>
                    <IconButton
                      ref={(node) => setCardRef(item.id, 'down', node)}
                      aria-label={`Eintrag ${n} nach unten verschieben`}
                      disabled={index === items.length - 1}
                      onClick={() => move(item, index, 1)}
                    >
                      <Icon name="arrow-down" size="md" />
                    </IconButton>
                    <IconButton aria-label={`Eintrag ${n} entfernen`} onClick={() => remove(item, index)}>
                      <Icon name="trash" size="md" />
                    </IconButton>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {fields.map((field, fieldIndex) => {
                    const value = String(item[field.key] ?? '');
                    const update = (next: string) =>
                      onAction({ type: 'update', id: item.id, patch: { [field.key]: next } as Partial<Omit<T, 'id'>> });
                    const firstRef =
                      fieldIndex === 0
                        ? (node: HTMLInputElement | HTMLTextAreaElement | null) => setCardRef(item.id, 'first', node)
                        : undefined;
                    return (
                      <Field
                        key={field.key}
                        label={field.label}
                        optional={field.optional}
                        hint={field.hint}
                        error={field.check?.(value)}
                        className={cn(!field.half && 'sm:col-span-2')}
                      >
                        {field.multiline ? (
                          <Textarea
                            ref={firstRef}
                            rows={4}
                            maxLength={field.maxLength}
                            placeholder={field.placeholder}
                            value={value}
                            onChange={(event) => update(event.target.value)}
                          />
                        ) : (
                          <Input
                            ref={firstRef}
                            autoComplete="off"
                            maxLength={field.maxLength}
                            placeholder={field.placeholder}
                            value={value}
                            onChange={(event) => update(event.target.value)}
                          />
                        )}
                      </Field>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {items.length < max ? (
        <Button ref={addRef} variant="outline" onClick={add} className="self-start">
          <Icon name="plus" size="md" />
          {addLabel}
        </Button>
      ) : (
        <p className="text-footnote text-ink-2 tabular-nums">Höchstens {max} Einträge.</p>
      )}
    </div>
  );
}
