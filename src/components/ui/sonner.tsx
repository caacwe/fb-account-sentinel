import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-sm",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-card group-[.toast]:text-foreground group-[.toast]:border group-[.toast]:border-border",
          cancelButton: "group-[.toast]:bg-card group-[.toast]:text-foreground",
          error: "group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border",
          success: "group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border",
          warning: "group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border",
          info: "group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
