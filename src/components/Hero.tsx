const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";

type HeroProps = {
  children?: React.ReactNode;
};

export default function Hero({ children }: HeroProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ height: "100vh"}}
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero_bg.jpeg"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ objectPosition: "50% 65%" }}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      {children ? (
        <div className="absolute inset-0 z-10">{children}</div>
      ) : null}
    </section>
  );
}
