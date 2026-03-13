# Replace the unused state with underscore prefix
sed -i '' 's/const \[loading, setLoading\]/const [_loading, _setLoading]/' src/hooks/useGoals.ts

# Update return to use underscore version or remove
sed -i '' 's/loading, setLoading/_loading, _setLoading/' src/hooks/useGoals.ts

npm run build

