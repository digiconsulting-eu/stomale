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
            "group toast group-[.toaster]:bg-primary group-[.toaster]:text-white group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-white/90",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-primary",
          cancelButton:
            "group-[.toast]:bg-white/20 group-[.toast]:text-white",
          closeButton:
            "group-[.toast]:bg-white/20 group-[.toast]:text-white group-[.toast]:opacity-100 group-[.toast]:transition-all group-[.toast]:duration-200 group-[.toast]:ease-in-out group-[.toast]:hover:bg-white/30 group-[.toast]:rounded-md group-[.toast]:p-1.5",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }