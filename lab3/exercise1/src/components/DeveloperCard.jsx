import { Fragment, useState } from "react";
import SkillBadge from "./SkillBadge";
import styles from "./DeveloperCard.module.css";

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
        <article className={styles.card} aria-labelledby="dev-heading">
            <header className={styles.header}>
                {avatarFailed ? (
                    <span className={styles.avatar} aria-label={fullName}>
                        {initials}
                    </span>
                ) : (
                    <img
                        className={styles.avatar}
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

            <dl className={styles.metrics}>
                {Object.entries(metrics).map(([key, value]) => (
                    <Fragment key={key}>
                        <dt>{key}</dt>
                        <dd>{value}</dd>
                    </Fragment>
                ))}
            </dl>

            <ul className={styles.skills} aria-label="Engineered Skills">
                {skills.map((skill) => (
                    <SkillBadge key={skill.id} {...skill} />
                ))}
            </ul>
        </article>
    );
}