function App() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="bg-amber-200">Test</h1>
      <h1>123</h1>
      <h1>{import.meta.env.VITE_TEST_VAR}</h1>
    </div>
  );
}

export default App;
