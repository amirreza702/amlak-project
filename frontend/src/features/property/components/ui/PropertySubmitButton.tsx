import { Button } from "@/shared/ui/button";

interface PropertySubmitButtonProps {
  isSubmitting: boolean;
}

export function PropertySubmitButton({
  isSubmitting,
}: PropertySubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full sm:w-auto"
    >
      {isSubmitting ? "در حال ثبت..." : "ثبت ملک"}
    </Button>
  );
}