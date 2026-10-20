import "./index.css";
import { MyComposition } from "./Composition";
import { SocialPromoComposition } from "./SocialPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <SocialPromoComposition />
    </>
  );
};
