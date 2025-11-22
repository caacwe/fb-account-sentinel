import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        duration: 2800,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card/95 group-[.toaster]:text-foreground group-[.toaster]:border-0 group-[.toaster]:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] group-[.toaster]:backdrop-blur-md group-[.toaster]:rounded-2xl group-[.toaster]:px-5 group-[.toaster]:py-4 group-[.toaster]:min-h-[60px]",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:border-0 group-[.toast]:rounded-xl group-[.toast]:font-medium group-[.toast]:px-4 group-[.toast]:transition-transform group-[.toast]:hover:scale-105",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-foreground group-[.toast]:rounded-xl group-[.toast]:px-4",
          error: "group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-destructive/10 group-[.toaster]:via-card/95 group-[.toaster]:to-card/95 group-[.toaster]:ring-2 group-[.toaster]:ring-destructive/20",
          success: "group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-success/10 group-[.toaster]:via-card/95 group-[.toaster]:to-card/95 group-[.toaster]:ring-2 group-[.toaster]:ring-success/20",
          warning: "group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-primary/10 group-[.toaster]:via-card/95 group-[.toaster]:to-card/95 group-[.toaster]:ring-2 group-[.toaster]:ring-primary/20",
          info: "group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-primary/5 group-[.toaster]:via-card/95 group-[.toaster]:to-card/95 group-[.toaster]:ring-1 group-[.toaster]:ring-border/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
