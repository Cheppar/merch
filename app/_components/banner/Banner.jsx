
"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Share2 } from "lucide-react";

import FormBanner from "../form/FormBanner";

const Home = () => {
  const [gradientColor, setGradientColor] = useState("#4facfe");
  const [bannerText, setBannerText] = useState("Hey! Secure discounted hikes");
  const [subText, setSubText] = useState("Join us for an adventure!");
  const [buttonStyle, setButtonStyle] = useState({
    backgroundColor: "white",
    color: "#2563eb",
  });
  const [buttonText, setButtonText] = useState("View Hikes");
  const [buttonLink, setButtonLink] = useState("https://example.com");
  const [borderWidth, setBorderWidth] = useState(0.5);
  const [marginColor, setMarginColor] = useState("#000000");
  const [backgroundImage, setBackgroundImage] = useState("/banner/wave.jpg");
  const [shareMessage, setShareMessage] = useState("Check this out!");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [textAlign, setTextAlign] = useState("center");

  const combinedButtonStyle = {
    ...buttonStyle,
    borderWidth: `${borderWidth}px`,
    borderStyle: "solid",
    borderColor: buttonStyle.color,
    margin: `4px`,
    boxShadow: `0 0 0 4px ${marginColor}`,
  };

  const handleCopyLink = () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `${shareMessage} ${shareUrl}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setIsDialogOpen(false);
    });
  };

  return (
    <div className="min-h-screen mt-16 bg-gray-100">
      {isBannerVisible && (
        <section className="w-full min-h-[300px] md:min-h-[400px] ml-0 mr-4 sm:mr-6 md:mr-8 flex items-center justify-center relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 z-0 rounded-xl">
            <Image
              src={backgroundImage}
              alt="Background image"
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              className="opacity-80 rounded-xl"
              onError={() => setBackgroundImage("/banner/wave.jpg")}
            />
          </div>
          <div
            className="absolute inset-0 z-10 rounded-xl"
            style={{
              background: `linear-gradient(to right, ${gradientColor}80, #e0f7fa80)`,
            }}
          ></div>
          <div className="absolute inset-0 bg-black opacity-30 z-10 rounded-xl"></div>
          <button
            onClick={() => setIsBannerVisible(false)}
            className="absolute top-4 right-4 z-30 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            aria-label="Close banner"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="container max-w-4xl mx-auto relative z-20 pl-0 pr-6 sm:pr-8 py-8">
            <div
              className={`flex flex-col gap-4 ${
                textAlign === "left"
                  ? "items-start"
                  : textAlign === "right"
                  ? "items-end"
                  : "items-center"
              }`}
            >
              <h1
                className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg text-${textAlign}`}
              >
                {bannerText}
              </h1>
              <p
                className={`text-base sm:text-lg md:text-xl text-white drop-shadow-md text-${textAlign}`}
              >
                {subText}
              </p>
              <div className="flex justify-center">
                <Link href={buttonLink} target="_blank" rel="noopener noreferrer">
                  <button
                    className="px-6 py-3 rounded-full text-base font-medium hover:opacity-90 transition-opacity"
                    style={combinedButtonStyle}
                  >
                    {buttonText}
                  </button>
                </Link>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDialogOpen(true)}
              className="absolute bottom-4 right-4 w-10 h-10 bg-blue-500 text-white hover:bg-blue-600 rounded-full z-20"
              aria-label="Share banner"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </section>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={`${shareMessage} ${
                typeof window !== "undefined" ? window.location.href : ""
              }`}
              readOnly
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleCopyLink}>Copy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <section className="container max-w-4xl mx-auto mt-8">
        <FormBanner
          onGradientChange={setGradientColor}
          onTextChange={setBannerText}
          onSubTextChange={setSubText}
          onButtonStyleChange={setButtonStyle}
          onButtonTextChange={setButtonText}
          onButtonLinkChange={setButtonLink}
          onBorderWidthChange={setBorderWidth}
          onMarginColorChange={setMarginColor}
          onBackgroundImageChange={setBackgroundImage}
          onShareMessageChange={setShareMessage}
          onTextAlignChange={setTextAlign}
          isBannerVisible={isBannerVisible}
          setIsBannerVisible={setIsBannerVisible}
        />
      </section>
    </div>
  );
};

export default Home;