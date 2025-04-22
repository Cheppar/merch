
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

const FormBanner = ({
  onGradientChange,
  onTextChange,
  onSubTextChange,
  onButtonStyleChange,
  onButtonTextChange,
  onButtonLinkChange,
  onBorderWidthChange,
  onMarginColorChange,
  onBackgroundImageChange,
  onShareMessageChange,
  onTextAlignChange,
  isBannerVisible,
  setIsBannerVisible,
}) => {
  const [localText, setLocalText] = useState("Hey! Secure discounted hikes");
  const [localSubText, setLocalSubText] = useState("Join us for an adventure!");
  const [localColor, setLocalColor] = useState("#4facfe");
  const [localButtonStyle, setLocalButtonStyle] = useState({
    backgroundColor: "#ffffff",
    color: "#2563eb",
  });
  const [localButtonText, setLocalButtonText] = useState("View Hikes");
  const [localButtonLink, setLocalButtonLink] = useState("https://example.com");
  const [localBorderWidth, setLocalBorderWidth] = useState(0.5);
  const [localMarginColor, setLocalMarginColor] = useState("#000000");
  const [localBackgroundImage, setLocalBackgroundImage] = useState("/waves.jpg");
  const [localShareMessage, setLocalShareMessage] = useState("Check this out!");
  const [localTextAlign, setLocalTextAlign] = useState("center");

  const handleTextChange = (event) => {
    setLocalText(event.target.value);
  };

  const handleSubTextChange = (event) => {
    setLocalSubText(event.target.value);
  };

  const handleColorChange = (event) => {
    setLocalColor(event.target.value);
  };

  const handleButtonBackgroundColorChange = (event) => {
    setLocalButtonStyle((prev) => ({
      ...prev,
      backgroundColor: event.target.value,
    }));
  };

  const handleButtonTextColorChange = (event) => {
    setLocalButtonStyle((prev) => ({
      ...prev,
      color: event.target.value,
    }));
  };

  const handleButtonTextChange = (event) => {
    setLocalButtonText(event.target.value);
  };

  const handleButtonLinkChange = (event) => {
    const value = event.target.value;
    if (value && !value.startsWith("https://")) {
      alert("Please enter a valid HTTPS URL (e.g., https://example.com)");
    }
    setLocalButtonLink(value || "https://example.com");
  };

  const handleBorderWidthChange = (value) => {
    setLocalBorderWidth(value[0]);
  };

  const handleMarginColorChange = (event) => {
    setLocalMarginColor(event.target.value);
  };

  const handleBackgroundImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setLocalBackgroundImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setLocalBackgroundImage("/waves.jpg");
    }
  };

  const handleDeleteImage = () => {
    if (
      window.confirm(
        "Are you sure you want to delete the selected image? This will revert to the default image."
      )
    ) {
      setLocalBackgroundImage("/waves.jpg");
      const fileInput = document.getElementById("background-image");
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  const handleShareMessageChange = (event) => {
    setLocalShareMessage(event.target.value);
  };

  const handleTextAlignChange = (align) => {
    setLocalTextAlign(align);
  };

  const handleTextFormSubmit = (event) => {
    event.preventDefault();
    onTextChange(localText);
    onSubTextChange(localSubText);
    onGradientChange(localColor);
    onBackgroundImageChange(localBackgroundImage);
    onTextAlignChange(localTextAlign);
  };

  const handleButtonFormSubmit = (event) => {
    event.preventDefault();
    onButtonStyleChange(localButtonStyle);
    onButtonTextChange(localButtonText);
    onButtonLinkChange(localButtonLink);
    onBorderWidthChange(localBorderWidth);
    onMarginColorChange(localMarginColor);
    onShareMessageChange(localShareMessage);
  };

  return (
    <div className="w-full px-4 sm:max-w-lg md:max-w-4xl mx-auto">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-gray-800 text-center">
        Customize Banner
      </h2>
      {!isBannerVisible && (
        <div className="mb-4 sm:mb-6">
          <Button
            onClick={() => setIsBannerVisible(true)}
            className="w-full bg-green-500 hover:bg-green-600 py-2 sm:py-3 text-sm sm:text-base"
          >
            Show Banner
          </Button>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Form 1: Text and Appearance */}
        <form
          onSubmit={handleTextFormSubmit}
          className="flex-1 bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-3 sm:space-y-4 min-h-[300px]"
        >
          <h3 className="text-base sm:text-lg font-medium text-gray-700">
            Banner Appearance
          </h3>
          {/* Banner Text Input */}
          <div>
            <label
              htmlFor="banner-text"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Banner Text:
            </label>
            <input
              id="banner-text"
              type="text"
              value={localText}
              onChange={handleTextChange}
              placeholder="Enter banner text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
          </div>
          {/* Subtext Input */}
          <div>
            <label
              htmlFor="sub-text"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Subtext:
            </label>
            <input
              id="sub-text"
              type="text"
              value={localSubText}
              onChange={handleSubTextChange}
              placeholder="Enter subtext"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
          </div>
          {/* Text Alignment Icons */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Text Alignment:
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={localTextAlign === "left" ? "default" : "outline"}
                onClick={() => handleTextAlignChange("left")}
                title="Align Left"
                aria-label="Align text left"
                className={`p-2 ${
                  localTextAlign === "left" ? "bg-blue-500 text-white" : ""
                }`}
              >
                <AlignLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                type="button"
                variant={localTextAlign === "center" ? "default" : "outline"}
                onClick={() => handleTextAlignChange("center")}
                title="Align Center"
                aria-label="Align text center"
                className={`p-2 ${
                  localTextAlign === "center" ? "bg-blue-500 text-white" : ""
                }`}
              >
                <AlignCenter className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                type="button"
                variant={localTextAlign === "right" ? "default" : "outline"}
                onClick={() => handleTextAlignChange("right")}
                title="Align Right"
                aria-label="Align text right"
                className={`p-2 ${
                  localTextAlign === "right" ? "bg-blue-500 text-white" : ""
                }`}
              >
                <AlignRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
          {/* Color Picker for Gradient */}
          <div>
            <label
              htmlFor="gradient-color"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Gradient Start Color:
            </label>
            <input
              id="gradient-color"
              type="color"
              value={localColor}
              onChange={handleColorChange}
              className="w-16 h-8 sm:h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
          {/* Background Image File Input */}
          <div>
            <label
              htmlFor="background-image"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Background Image:
            </label>
            <input
              id="background-image"
              type="file"
              accept="image/*"
              onChange={handleBackgroundImageChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 text-sm sm:text-base"
            />
            {localBackgroundImage !== "/waves.jpg" && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <img
                  src={localBackgroundImage}
                  alt="Selected background preview"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="text-xs sm:text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Delete Image
                </button>
              </div>
            )}
          </div>
          {/* Apply Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 sm:py-3 rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              Apply Appearance
            </button>
          </div>
        </form>
        {/* Form 2: Button and Sharing */}
        <form
          onSubmit={handleButtonFormSubmit}
          className="flex-1 bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-3 sm:space-y-4 min-h-[300px]"
        >
          <h3 className="text-base sm:text-lg font-medium text-gray-700">
            Button & Sharing
          </h3>
          {/* Button Color Pickers */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[100px]">
              <label
                htmlFor="button-bg-color"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Button Background Color:
              </label>
              <input
                id="button-bg-color"
                type="color"
                value={localButtonStyle.backgroundColor}
                onChange={handleButtonBackgroundColorChange}
                className="w-16 h-8 sm:h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label
                htmlFor="button-text-color"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Button Text Color:
              </label>
              <input
                id="button-text-color"
                type="color"
                value={localButtonStyle.color}
                onChange={handleButtonTextColorChange}
                className="w-16 h-8 sm:h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>
          {/* Button Text Input */}
          <div>
            <label
              htmlFor="button-text"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Button Text:
            </label>
            <input
              id="button-text"
              type="text"
              value={localButtonText}
              onChange={handleButtonTextChange}
              placeholder="Enter button text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
          </div>
          {/* Button Link Input */}
          <div>
            <label
              htmlFor="button-link"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Button Link:
            </label>
            <input
              id="button-link"
              type="url"
              value={localButtonLink}
              onChange={handleButtonLinkChange}
              placeholder="Enter HTTPS URL (e.g., https://example.com)"
              pattern="https://.*"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
          </div>
          {/* Border Width Slider */}
          <div>
            <label
              htmlFor="border-width"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Button Border Width: {localBorderWidth}px
            </label>
            <Slider
              id="border-width"
              valuelabel={`${localBorderWidth}px`}
              min={0.5}
              max={3}
              step={0.1}
              value={[localBorderWidth]}
              onValueChange={handleBorderWidthChange}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-xs sm:text-sm text-gray-500">
              <span>0.5</span>
              <span>3.0</span>
            </div>
          </div>
          {/* Margin Color Picker */}
          <div>
            <label
              htmlFor="margin-color"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Margin Color:
            </label>
            <input
              id="margin-color"
              type="color"
              value={localMarginColor}
              onChange={handleMarginColorChange}
              className="w-16 h-8 sm:h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
          {/* Share Message Input */}
          <div>
            <label
              htmlFor="share-message"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Share Message:
            </label>
            <input
              id="share-message"
              type="text"
              value={localShareMessage}
              onChange={handleShareMessageChange}
              placeholder="Enter share message"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
          </div>
          {/* Apply Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 sm:py-3 rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              Apply Button & Sharing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormBanner;