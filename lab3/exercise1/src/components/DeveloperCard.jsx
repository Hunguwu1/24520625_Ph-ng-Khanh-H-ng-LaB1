import { Fragment, useState } from "react";
import SkillBadge from "./SkillBadge";

export default function DeveloperCard({
    fullName = "Tran Vinh Khiem",
    role = "Senior Systems Architect • UIT S3T",
    avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240",
    metrics = { commits: 512, solved: 101 },
    skills = [{ id: "sk-1", name: "React 19 Fiber", tier: "Core" }],
}) {
    const [avatarFailed, setAvatarFailed] = useState(false);
    const initials = fullName
        .split(" ")
        .map((part) => part[0])
        .slice(-2)
        .join("")
        .toUpperCase();
    return (
        <article aria-labelledby="dev-heading">
            <header>
                {avatarFailed ? (
                    <span aria-label={fullName}>{initials}</span>
                ) : (
                    <img
                        src={avatarUrl}
                        alt={fullName}
                        width="64"
                        height="64"
                        onError={() => setAvatarFailed(true)}
                    />
                )}
                <hgroup>
                    <h2 id="dev-heading">{fullName}</h2>
                    <p>{role}</p>
                </hgroup>
            </header>

            <dl>
                {Object.entries(metrics).map(([key, value]) => (
                    <Fragment key={key}>
                        <dt>{key}</dt>
                        <dd>{value}</dd>
                    </Fragment>
                ))}
            </dl>

            <ul aria-label="Engineered Skills">
                {skills.map((skill) => (
                    <SkillBadge key={skill.id} {...skill} />
                ))}
            </ul>
        </article>
    );
}