import { PaletteIcon } from "lucide-react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/ThemeStore";

const ThemeSelector = () => {
    const { theme, setTheme } = useThemeStore();
    return (
        <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-circle">
                <PaletteIcon className="size-5"/>
            </button>
            <div  tabIndex={0} className="dropdown-content mt-2 p-1 shadow-2xl bg-base-200 backdrop-blur-lg
            rounded-2xl w-56 border border-base-content/10 max-h-80 overflow-y-auto">
                <div className="space-y-1">
                    {THEMES.map((option) => {
                        return (
                            <button
                                key={option.name}
                                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-colors
                                ${
                                    theme === option.name
                                        ? "bg-primary text-primary"
                                        : "hover:bg-base-content/5"
                                }}`}
                                onClick={() => setTheme(option.name)}
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
};

export default ThemeSelector;