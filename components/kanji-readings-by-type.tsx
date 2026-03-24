import type { ClassifiedReadings } from '@/lib/kanji-readings';

interface KanjiReadingsByTypeProps {
  readings: ClassifiedReadings;
}

export function KanjiReadingsByType({ readings }: KanjiReadingsByTypeProps) {
  const amHanViet = readings.amHanViet;
  const hasKunyomi = readings.kunyomi.length > 0;
  const hasOnyomi = readings.onyomi.length > 0;
  if (!hasKunyomi && !hasOnyomi) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-muted-foreground">
        Examples by reading type
      </h3>

      {hasKunyomi && (
        <section>
          <span className="inline-block rounded-md bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
            Kunyomi
          </span>
          <div className="mt-3 space-y-6">
            {readings.kunyomi.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 border-l-4 border-orange-500 pl-2">
                  <span className="text-lg font-medium text-orange-600 dark:text-orange-500">
                    {group.label}
                  </span>
                </div>
                <div className="mt-2 overflow-hidden rounded-md border">
                  <table className="w-full text-sm">
                    <tbody>
                      {group.examples.map((ex, i) => (
                        <tr
                          key={i}
                          className="border-b last:border-b-0 even:bg-muted/30"
                        >
                          <td className="w-[30%] border-r p-2 font-medium">
                            {ex.word}
                          </td>
                          <td className="w-[30%] border-r p-2 text-muted-foreground">
                            {ex.reading}
                          </td>
                          <td className="w-[20%] border-r p-2 text-muted-foreground">
                            {amHanViet ?? '-'}
                          </td>
                          <td className="p-2">{ex.meaning || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasOnyomi && (
        <section>
          <span className="inline-block rounded-md bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
            Onyomi
          </span>
          <div className="mt-3 space-y-6">
            {readings.onyomi.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 border-l-4 border-orange-500 pl-2">
                  <span className="text-lg font-medium text-orange-600 dark:text-orange-500">
                    {group.label}
                  </span>
                </div>
                <div className="mt-2 overflow-hidden rounded-md border">
                  <table className="w-full text-sm">
                    <tbody>
                      {group.examples.map((ex, i) => (
                        <tr
                          key={i}
                          className="border-b last:border-b-0 even:bg-muted/30"
                        >
                          <td className="w-[30%] border-r p-2 font-medium">
                            {ex.word}
                          </td>
                          <td className="w-[30%] border-r p-2 text-muted-foreground">
                            {ex.reading}
                          </td>
                          <td className="w-[20%] border-r p-2 text-muted-foreground">
                            {amHanViet ?? '-'}
                          </td>
                          <td className="p-2">{ex.meaning || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
