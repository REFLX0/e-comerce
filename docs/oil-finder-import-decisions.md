# Import « Trouver mon huile » — décisions à confirmer

## Produits sans prix

Les 24 huiles sources n’ont ni prix ni stock. L’import crée donc une variante
`5L` avec le SKU suffixé `PRICE-TBD-5L`, un prix de `0` uniquement parce que le
schéma exige une valeur numérique, et un stock de `0`. Elles restent visibles
dans le finder et la carte affiche « Prix sur demande » ; elles ne peuvent pas
être ajoutées au panier. Dès qu’un prix est saisi, remplacer cette variante par
la vraie contenance, le prix et le stock.

## « Light Commercial »

Le CSV compte cinq huiles étiquetées `Passenger Car,Light Commercial`. Le
schéma ne distingue pas les véhicules utilitaires légers : pour ne pas les
masquer du finder automobile, l’import les mappe temporairement vers
`AUTOMOBILE`. À confirmer avec l’équipe catalogue avant d’introduire une
catégorie ou un type de véhicule distinct.

## Carburant LPG

Une huile est aussi étiquetée LPG. `FuelType` ne contient actuellement que
`ESSENCE` et `DIESEL` ; LPG est donc ignoré à l’import sans altérer les deux
valeurs compatibles existantes.
