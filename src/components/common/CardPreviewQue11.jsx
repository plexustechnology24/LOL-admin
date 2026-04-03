import React from "react";

const CardPreviewQue11 = ({ image }) => {

    const questionText = "Will I go to heaven or hell anonymously?"
    const annoyans = [
        { question: "Mood swings daily", answer: "Hell" },
        { question: "Fake prank", answer: "Heaven" },
        { question: "Send pic now!", answer: "Hell" },
        { question: "Screenshot chats", answer: "Heaven" },
    ];

    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return (
        <div
            className="absolute top-0 left-1/2 h-full flex flex-col items-center justify-center w-full transform -translate-x-1/2 text-gray-800 rounded-lg shadow-lg text-center"
        >
            <div
                className="flex flex-col items-center justify-between h-[650px] rounded-3xl  border-4 border-black overflow-hidden w-full"
                style={{
                    backgroundImage: image ? `url(${image})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >

                {/* Name Shape */}
                <div className="mx-auto flex justify-center items-center w-[90%] h-[25%]">
                    <div
                        className={`w-full relative "bg-transparent`}
                        style={{
                            height: "130px",
                        }}
                    >
                        {/* SVG Background */}
                        <svg className='mt-2'
                            viewBox="0 0 295 111"
                            preserveAspectRatio="none"
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                zIndex: 0,
                            }}
                            fill="none"
                        >
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M80.0614 97.5768C100.665 102.083 101.535 97.0238 110.359 93.0408C114.479 98.2792 121.689 102.028 129.098 102.911C140.419 104.26 146.018 101.52 153.142 98.2753C158.353 101.997 158.93 104.147 166.878 107.101C182.619 112.952 208.201 107.517 213.042 90.2853C215.305 90.8493 217.016 91.6005 219.361 91.9953C225.752 93.0709 230.8 92.0052 236.946 90.0455C246.985 86.8449 248.763 81.362 251.391 78.3331C262.946 81.9556 275.081 81.6078 284.237 74.8165C284.358 74.727 284.531 74.6038 284.649 74.5124L290.211 68.2531C302.692 45.8132 277.544 24.1255 249.418 34.2883C240.909 9.21831 205.523 9.41778 194.023 17.8333C191.31 16.6663 183.506 7.858 168.446 5.84103C154.499 3.97295 146.189 6.89731 136.654 10.9461C133.771 9.65339 130.964 7.3321 127.212 5.52648C123.798 3.88349 120.025 2.53059 115.462 1.67182C105.963 -0.115578 95.7135 0.77935 87.9782 3.61533C71.4002 9.69257 63.7985 20.4595 62.4859 35.4639C43.2994 32.5822 28.3585 40.4692 27.8078 54.7667C-10.727 51.0658 -7.96644 98.9733 35.2225 89.6486C39.6497 105.688 63.9132 110.037 80.0614 97.5768Z" fill="white" />
                            <path d="M80.0614 97.5768C100.665 102.083 101.535 97.0238 110.359 93.0408C114.479 98.2792 121.689 102.028 129.098 102.911C140.419 104.26 146.018 101.52 153.142 98.2753C158.353 101.997 158.93 104.147 166.878 107.101C182.619 112.952 208.201 107.517 213.042 90.2853C215.305 90.8493 217.016 91.6005 219.361 91.9953C225.752 93.0709 230.8 92.0052 236.946 90.0454C246.985 86.8449 248.763 81.362 251.391 78.3331C262.946 81.9556 275.081 81.6078 284.237 74.8165C284.358 74.727 284.531 74.6038 284.649 74.5124L290.211 68.2531C302.692 45.8132 277.544 24.1255 249.418 34.2883C240.909 9.21831 205.523 9.41777 194.023 17.8333C191.31 16.6663 183.506 7.858 168.446 5.84103C154.499 3.97294 146.189 6.89731 136.654 10.9461C133.771 9.65339 130.964 7.3321 127.212 5.52648C123.798 3.88349 120.025 2.53059 115.462 1.67182C105.963 -0.115578 95.7135 0.779347 87.9782 3.61533C71.4002 9.69257 63.7985 20.4595 62.4859 35.4639C43.2994 32.5822 28.3585 40.4692 27.8078 54.7667C-10.727 51.0658 -7.96644 98.9733 35.2225 89.6486C39.6497 105.688 63.9132 110.037 80.0614 97.5768Z" stroke="#231F20" stroke-width="1.5001" stroke-miterlimit="2.61313" />
                        </svg>

                        {/* Text */}
                        <span
                            className={`text-black absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[65%]
      top-[60%] text-center bricolage-grotesque4 text-[20px]`}
                        >
                            {questionText}
                        </span>
                    </div>
                </div>

                {/* Avatar Section */}
                <div
                    className={`circle my-1 mb-2 mx-auto relative rounded-full flex justify-center items-center`}
                    style={{
                        width: "135px",
                        height: "135px",
                    }}
                >
                    {/* Main Avatar */}
                    <img
                        className={`mb-1 object-contain relative z-[3] w-[80%] h-[80%]`}
                        src={"https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question11/avatar4.png"}
                        alt={"avatar"}
                    />

                        <img
                            src={"https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question11/center1.png"}
                            alt="top icon"
                            className="absolute top-0 right-0 w-full h-full object-contain z-[2]"
                        />

                </div>

                {/* Answers Table */}
                <div className=" px-6 pt-2 flex-col relative pb-8 flex justify-center items-center font-black w-full h-[35%]">
                    <div
                        className="flex justify-center items-center overflow-hidden bg-white min-h-[185px] border-2 border-[#363435] py-10 w-full bg-cover bg-center rounded-[10px]"
                    >
                        <table className="w-[94%] text-[16px] border-none">
                            <tbody>
                                {annoyans?.map((value, index) => {
                                    const isLast = index === annoyans.length - 1;
                                    const rowClass = isLast ? "pb-0" : "pb-3";

                                    return (
                                        <tr key={index}>
                                            <td className={`text-center ${rowClass} bricolage-grotesque text-[#373435] align-top w-1/2`}>
                                                {capitalizeFirstLetter(value.question)}
                                            </td>

                                            <td className={`text-center ${rowClass} bricolage-grotesque text-[#373435] align-top w-[1%]`}>
                                                :
                                            </td>

                                            <td className={`text-center pl-2 ${rowClass} bricolage-grotesque text-[#373435] align-top w-[49%]`}>
                                                {capitalizeFirstLetter(value.answer)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>


                    <div
                        className="absolute -top-[10px] inline-flex items-center justify-center px-4 font-bold text-[18px] h-[40px] min-w-[150px] whitespace-nowrap"
                    >
                        {/* SVG Background */}
                        <svg
                            viewBox="0 0 142 37"
                            preserveAspectRatio="none"
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                zIndex: 0
                            }}
                            fill="none"
                        >
                            <path d="M142 18.4995L138.86 19.4743C137.268 19.9683 136.14 22.3243 134.833 25.0488C133.606 27.6083 132.215 30.51 130.029 32.8306C127.638 35.3689 124.744 36.7245 121.204 36.9613V36.9955H120.42C120.302 36.9982 120.18 37 120.057 37V36.9955H21.9425V37C21.8236 37 21.7053 37 21.5877 36.9955H21.5697C17.6755 36.9137 14.5341 35.5515 11.9722 32.8306C9.78589 30.51 8.3952 27.6083 7.16815 25.0488C5.86127 22.323 4.73327 19.9686 3.1411 19.4749L0 18.4995L3.1395 17.5247C4.73183 17.031 5.85958 14.6747 7.16621 11.9505C8.39376 9.39171 9.78302 6.49 11.9708 4.16938C14.5343 1.44874 17.6752 0.0863304 21.5711 0.00451705C21.6926 0.00177223 21.8169 1.1573e-06 21.9427 1.1573e-06H120.057C120.182 1.1573e-06 120.307 1.37871e-06 120.43 0.00451705C124.324 0.0863304 127.466 1.44847 130.027 4.16938C132.216 6.49 133.606 9.39171 134.833 11.9535C136.14 14.6792 137.268 17.0335 138.86 17.5274L142 18.4995Z" fill="white" />
                            <path d="M138.86 17.5269C137.268 17.0332 136.14 14.6769 134.833 11.953C133.606 9.3934 132.215 6.49177 130.029 4.17115C127.467 1.45042 124.325 0.0881003 120.432 0.00628693C120.308 0.00354211 120.184 0.00177104 120.059 0.00177104H21.9425C21.8166 0.00177104 21.6925 0.00177126 21.5707 0.00628693C17.6748 0.0881003 14.5353 1.45042 11.9703 4.17115C9.78327 6.49177 8.39376 9.3934 7.16621 11.9553C5.85966 14.682 4.73183 17.0357 3.13975 17.5297L0 18.5012L3.13975 19.4749C4.73183 19.9687 5.85966 22.3248 7.16671 25.0487C8.39376 27.6086 9.78429 30.5102 11.9708 32.8306C14.5344 35.5515 17.6752 36.9137 21.568 36.9957H21.586C21.7037 36.9982 21.8219 37 21.9408 37V36.9957H120.057V37C120.179 37 120.301 37 120.42 36.9957H121.204V36.9613C124.745 36.7244 127.638 35.3681 130.029 32.8306C132.216 30.5102 133.606 27.6086 134.834 25.0487C136.14 22.3223 137.268 19.9682 138.86 19.4743L142 18.4995L138.86 17.5269ZM133.321 24.0679C130.907 29.1057 128.171 34.8154 120.401 34.9815H21.5983C13.831 34.8154 11.0942 29.1034 8.67997 24.0679C7.5841 21.7811 6.59734 19.7228 5.24614 18.5012C6.59734 17.2817 7.5841 15.2233 8.67997 12.9348C11.0947 7.89579 13.8321 2.18461 21.6066 2.02045C21.7178 2.01771 21.831 2.01718 21.9447 2.01718H120.057C120.17 2.01718 120.283 2.01718 120.397 2.02045C128.169 2.18461 130.906 7.89579 133.321 12.9348C134.417 15.2216 135.404 17.28 136.755 18.5012C135.404 19.721 134.417 21.7801 133.321 24.0679Z" fill="#040404" />
                        </svg>

                        {/* Text */}
                        <span className="relative z-[1] font-bold text-[17px] leading-[15px] bricolage-grotesque text-black">
                            Heaven
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CardPreviewQue11;