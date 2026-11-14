import { Popover } from '@base-ui/react/popover';
import { useRef, type ReactNode } from 'react';
import { useFloatingNotes } from '../FloatingNotes';

export function Note({ id, label, text, children, className, tag }: {
  id: string; label: string; text: string; children: ReactNode; className: string; tag?: string;
}) {
  const context = useFloatingNotes();
  const container = useRef<HTMLSpanElement>(null);
  const open = context.active === id;
  return <Popover.Root open={open} onOpenChange={nextOpen => context.setOpen(id, nextOpen)}>
    <span ref={container} className="float-wrap">
      <Popover.Trigger openOnHover delay={0} closeDelay={0} className={`${className} float-trigger`}
        data-tag={tag} aria-label={label} aria-controls={id}>{children}</Popover.Trigger>
      <Popover.Portal container={container} render={<span />}>
        <Popover.Positioner render={<span />} className="float-positioner">
          <Popover.Popup render={<span />} id={id} className="float-note" hidden={!open}
            aria-label={label} initialFocus={false} finalFocus={false}>{text}</Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </span>
  </Popover.Root>;
}
