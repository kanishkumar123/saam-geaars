import TankGame from "./ui/TankGame";

export default function SecretRoute() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111" }}>
      <TankGame />
    </div>
  );
}
