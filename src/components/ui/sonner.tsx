import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      duration={Infinity}
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-primary group-[.toaster]:text-white group-[.toaster]:border-border group-[.toaster]:shadow-lg relative",
          description: "group-[.toast]:text-white/90",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-primary",
          cancelButton:
            "group-[.toast]:bg-white/20 group-[.toast]:text-white",
          closeButton:
            "group-[.toast]:absolute group-[.toast]:right-2 group-[.toast]:top-2 group-[.toast]:p-2 group-[.toast]:rounded-md group-[.toast]:bg-white/30 group-[.toast]:text-white group-[.toast]:opacity-100 group-[.toast]:hover:bg-white/40 group-[.toast]:transition-colors",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }