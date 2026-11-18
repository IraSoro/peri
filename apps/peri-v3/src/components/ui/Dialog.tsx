import { Dialog as DialogPrimitive } from "@base-ui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "./IconButton";
import { Typography } from "./Typography";

export type DialogProps = DialogPrimitive.Root.Props;

export const Dialog = (props: DialogProps) => {
  return <DialogPrimitive.Root {...props} />;
};

export type DialogTriggerProps = DialogPrimitive.Trigger.Props;

export const DialogTrigger = (props: DialogTriggerProps) => {
  return <DialogPrimitive.Trigger {...props} />;
};

export type DialogCloseProps = DialogPrimitive.Close.Props;

export const DialogClose = (props: DialogCloseProps) => {
  return <DialogPrimitive.Close {...props} />;
};

export type DialogContentProps = DialogPrimitive.Popup.Props;

export const DialogContent = ({ className, ...props }: DialogContentProps) => {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <DialogPrimitive.Popup
        {...props}
        className={cn(
          "bg-base-bg text-base-primary fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl pb-[env(safe-area-inset-bottom)] transition-[translate,opacity] duration-300 ease-out data-ending-style:translate-y-full data-starting-style:translate-y-full md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:mx-0 md:max-h-[80dvh] md:w-[calc(100%-2rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:pb-0 md:duration-200 md:data-ending-style:-translate-y-1/2 md:data-ending-style:opacity-0 md:data-starting-style:-translate-y-1/2 md:data-starting-style:opacity-0",
          className,
        )}
      />
    </DialogPrimitive.Portal>
  );
};

export const DialogHeader = ({ title }: { title: string }) => {
  return (
    <div className="px-4 py-3 md:px-6 md:py-4">
      <div className="flex w-full items-center justify-between">
        <DialogPrimitive.Title render={<Typography size={3} weight="bold" />}>
          {title}
        </DialogPrimitive.Title>
        <DialogPrimitive.Close
          render={
            <IconButton aria-label="Close">
              <X />
            </IconButton>
          }
        />
      </div>
    </div>
  );
};
