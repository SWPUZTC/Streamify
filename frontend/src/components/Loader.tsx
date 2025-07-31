import { Loader2Icon } from "lucide-react"
import { useThemeStore } from "../store/ThemeStore";

const Loader: React.FC = () => {
    const { theme } = useThemeStore();
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2Icon className="animate-spin size-10 text-primary" data-theme={theme}/>
        </div>
    )
}

export default Loader;