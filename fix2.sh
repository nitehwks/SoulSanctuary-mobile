# Fix server/index.ts - PORT parsing
sed -i '' 's/const PORT = process.env.PORT || 3001;/const PORT = parseInt(process.env.PORT || '\''3001'\'', 10);/' server/index.ts

# Fix server/vite.ts - add express import
sed -i '' '1s/^/import express from '\''express'\'';\n/' server/vite.ts

# Fix src/hooks/useGoals.ts - add loading to state
sed -i '' 's/const \[, setLoading\]/const [loading, setLoading]/' src/hooks/useGoals.ts

# Fix src/hooks/useGoals.ts - remove loading from return or add setLoading
# Option A - remove loading:
sed -i '' 's/, loading };/ };/' src/hooks/useGoals.ts
# Option B - add setLoading to return (uncomment if needed):
# sed -i '' 's/, loading };/, loading, setLoading };/' src/hooks/useGoals.ts

# Fix src/pages/dashboard/MoodTracker.tsx - remove unused loading
sed -i '' 's/, loading }/ }/' src/pages/dashboard/MoodTracker.tsx

# Run build
npm run build

