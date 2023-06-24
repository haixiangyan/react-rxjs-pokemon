import {createContext, FC, PropsWithChildren, useContext} from "react";
import {BehaviorSubject, combineLatestWith, map} from "rxjs";

export interface Pokemon {
  id: number,
  name: string,
  type: string[],
  hp: number,
  attack: number,
  defense: number,
  special_attack: number,
  special_defense: number,
  speed: number;
  power?: number;
  selected?: boolean;
}

const rawPokemon$ = new BehaviorSubject<Pokemon[]>([]);

const pokemonWithPower$ = rawPokemon$.pipe(
  map(pokemon => {
    return pokemon.map(p => ({
      ...p,
      power: p.hp + p.attack + p.defense + p.special_attack + p.special_defense + p.speed,
    }))
  })
);

const selected$ = new BehaviorSubject<number[]>([]);

const pokemon$ = pokemonWithPower$.pipe(
  combineLatestWith(selected$),
  map(([pokemon, selected]) => {
    return pokemon.map((p) => ({
      ...p,
      selected: selected.includes(p.id),
    }))
  })
)

const deck$ = pokemon$.pipe(
  map((pokemon) => pokemon.filter((p) => p.selected))
)

fetch('/pokemon-data.json')
  .then(res => res.json())
  .then(data => rawPokemon$.next(data))

const PokemonContext = createContext({
  pokemon$,
  selected$,
  deck$,
})

export const usePokemon = () => useContext(PokemonContext);

export const PokemonProvider: FC<PropsWithChildren> = ({ children }) => (
  <PokemonContext.Provider value={{
    pokemon$,
    selected$,
    deck$,
  }}>
    {children}
  </PokemonContext.Provider>
)
