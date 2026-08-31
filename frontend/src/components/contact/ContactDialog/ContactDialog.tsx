import { Dialog, DialogContent } from '@/components/ui/dialog';
import ContactDialogBody, {
  type ContactDialogBodyProps,
} from '@/components/contact/ContactDialogBody/ContactDialogBody';

interface ContactDialogProps extends ContactDialogBodyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ContactDialog({ open, onOpenChange, ...body }: ContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-2xl p-6 shadow-xl sm:max-w-md">
        {open && (
          <ContactDialogBody key={`${body.trialRef}:${body.preselectedSiteName ?? ''}`} {...body} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ContactDialog;
