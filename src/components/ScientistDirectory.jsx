import { useId, useState } from "react";
import { SMART_PEOPLE } from "../data/smartPeople";

export default function ScientistDirectory({
    initialData = SMART_PEOPLE,
}) {
    const queryId = useId();
    const minIqId = useId();
    const sortId = useId();

    const [people, setPeople] = useState(initialData);
    const [query, setQuery] = useState("");
    const [minIq, setMinIq] = useState(160);
    const [sortBy, setSortBy] = useState("iq-desc");

    const visiblePeople = people
        .filter(
            (person) =>
                person.name.toLowerCase().includes(query.trim().toLowerCase()) &&
                person.iq >= minIq
        )
        .toSorted((a, b) =>
            sortBy === "iq-desc" ? b.iq - a.iq : a.age - b.age
        );
    return (
        <section aria-label="Pioneer Directory">
            <h1>Scientist & Pioneer Directory</h1>
            <form role="search" onSubmit={(event) => event.preventDefault()}>
                <div>
                    <label htmlFor={queryId}>Tìm theo tên: </label>
                    <input
                        id={queryId}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Nhập tên nhà khoa học"
                    />
                </div>

                <div>
                    <label htmlFor={minIqId}>IQ tối thiểu: </label>
                    <input
                        id={minIqId}
                        type="number"
                        value={minIq}
                        onChange={(event) => {
                            const value = event.target.valueAsNumber;
                            setMinIq(Number.isNaN(value) ? 0 : value);
                        }}
                    />
                </div>

                <div>
                    <label htmlFor={sortId}>Sắp xếp: </label>
                    <select
                        id={sortId}
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                    >
                        <option value="iq-desc">IQ giảm dần</option>
                        <option value="age-asc">Tuổi tăng dần</option>
                    </select>
                </div>
            </form>

            <ul>
                {visiblePeople.map((person) => (
                    <li key={person.id}>
                        {person.name} — Tuổi: {person.age} — IQ: {person.iq}
                    </li>
                ))}
            </ul>
        </section>
    );
}