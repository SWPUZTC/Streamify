import { LANGUAGE_TO_FLAG } from "../constants";
import { Link } from "react-router-dom";
interface FriendCardProps {
    avatar: string;
    name: string;
    nativelanguage: string;
    learninglanguage: string;
    _id: string;
}

const FriendCard = (props: FriendCardProps) => {
    return (
        <div className="card bg-base-200 hover:shadow-md transition-shadow">
            <div className="card-body p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="avatar size-12">
                        <img src={props.avatar} alt={props.name} />
                    </div>
                    <h3 className="font-semibold truncate">{props.name}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="badge badge-secondary text-xs">
                        {getLanguageFlag(props.nativelanguage)}
                        Native: {props.nativelanguage}
                    </span>
                    <span className="badge badge-outline text-xs">
                        {getLanguageFlag(props.learninglanguage)}
                        Learning: {props.learninglanguage}
                    </span>
                </div>
                <Link to={`/chat/${props._id}`} className="btn btn-outline w-full">
                    Message
                </Link>
            </div>
        </div>
    )
}

export default FriendCard

export function getLanguageFlag(language: string) {
    if (!language) return null;

    const langLower = language.toLowerCase();
    const countryCode = LANGUAGE_TO_FLAG[langLower];

    if (countryCode) {
        return (
            <img
                src={`https://flagcdn.com/24x18/${countryCode}.png`}
                alt={`${langLower} flag`}
                className="h-3 mr-1 inline-block"
            />
        );
    }
    return null;
}