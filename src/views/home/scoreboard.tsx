import { sideName, type Game } from "@/lib";

type ScoreboardProps = {
  game: Game;
};

export default function Scoreboard({ game }: ScoreboardProps) {
  const tallies = [
    {
      label: `X (${sideName(game, "x")})`,
      score: game.scores.x,
      colour: "bg-x",
    },
    { label: "Ties", score: game.scores.ties, colour: "bg-muted" },
    {
      label: `O (${sideName(game, "o")})`,
      score: game.scores.o,
      colour: "bg-o",
    },
  ];

  return (
    <dl className="grid grid-cols-3 gap-5">
      {tallies.map(({ label, score, colour }) => (
        <div
          key={label}
          className={`flex h-16 flex-col items-center justify-center rounded-md text-page md:h-18 md:rounded-lg ${colour}`}
        >
          <dt className="text-body-s uppercase md:text-body">{label}</dt>
          <dd className="text-heading-s tabular-nums md:text-heading-m">
            {score}
          </dd>
        </div>
      ))}
    </dl>
  );
}
