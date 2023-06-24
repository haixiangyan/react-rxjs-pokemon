import React, {useMemo} from 'react';
import {useObservableState} from "observable-hooks";
import {BehaviorSubject, combineLatestWith, map} from "rxjs";

import {PokemonProvider, usePokemon} from "./store";

const Deck = () => {
  const { deck$ } = usePokemon();

  const deck = useObservableState(deck$, []);

  return (
    <div>
      <h4>Deck</h4>
      <div>
        {deck.map(p => (
          <div key={p.id} style={{ display: "flex" }}>
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt=""/>

            <div>
              <div>{p.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Search = () => {
  const { pokemon$, selected$ } = usePokemon()

  const search$ = useMemo(() => new BehaviorSubject(""), []);

  const [filteredPokemon] = useObservableState(() => {
    return pokemon$.pipe(
      combineLatestWith(search$),
      map(([pokemon, search]) => pokemon.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())))
    )
  }, []);

  return (
    <div>
      <input type="text" value={search$.value} onChange={e => search$.next(e.target.value)}/>

      <div>
        {filteredPokemon.map(p => (
          <div key={p.name}>
            <label htmlFor={p.id.toString()}>
              <input
                id={p.id.toString()}
                type="checkbox"
                checked={p.selected}
                onChange={() => {
                  if (selected$.value.includes(p.id)) {
                    selected$.next(selected$.value.filter((id) => id !== p.id))
                  } else {
                    selected$.next([...selected$.value, p.id])
                  }
                }}
              />
              <strong>{p.name}</strong> - {p.power}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  return (
    <PokemonProvider>
      <div className="App" style={{ display: "grid", gridTemplateColumns: "1fr 1fr"}}>
        <Search />
        <Deck />
      </div>
    </PokemonProvider>
  );
}

export default App;
