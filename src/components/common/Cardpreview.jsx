import React from "react";


const CardPreview = ({ image }) => {

    const annoyans = [
        { question: "Fav food", answer: "Pizza lover" },
        { question: "Fav color", answer: "Deep blue" },
        { question: "Hobby", answer: "Cricket play" },
        { question: "Pet name", answer: "Cutie pie" },
    ];

    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return (
        <div
            className="absolute top-0 left-1/2 h-full flex flex-col items-center justify-center w-full transform -translate-x-1/2 text-gray-800 rounded-lg shadow-lg text-center"
        >
            <div className="flex flex-col items-center justify-between h-[650px] rounded-3xl border-4 border-black overflow-hidden w-full"
                style={{
                    backgroundImage: image ? `url(${image})` : "none", // ✅ set bg image
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }} >

                {/* Name Shape */}
                <div
                    className="mx-auto flex justify-center items-center bg-center bg-no-repeat"
                    style={{
                        width: "75%",
                        height: "20%",
                        backgroundImage: `url(https://lol-image-bucket.s3.ap-south-1.amazonaws.com/shape2.png)`,
                        backgroundSize: "250px 130px",
                    }}
                >
                    <p className={`Spider text-3xl pb-2`} style={{ color: "#3E4095" }}>
                        Nickname
                    </p>
                </div>

                {/* Avatar Section */}
                <div
                    className={`circle my-1 mb-2 mx-auto relative rounded-full flex justify-center items-center bg-white border-[3px] border-[#353435]`}
                    style={{
                        width: "165px",
                        height: "165px",
                    }}
                >
                    <div className="w-full h-full overflow-hidden rounded-full">
                        <div
                            className="w-full h-full bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(https://lol-image-bucket.s3.amazonaws.com/images/Avatar/Avatar-2abd0e32-c2a4-45ae-981b-433b5c7d9a5c.png)` }}
                        />
                    </div>
                </div>

                {/* Answers Table */}
                <div className="pt-2 px-6 pb-8 flex justify-center items-center font-black w-full">
                    <div className="flex justify-center items-center overflow-hidden bg-white min-h-[60%] w-[95%] rounded-[10px] border-2 border-[#363435]">

                        <div
                            className="flex justify-center items-center overflow-hidden min-h-[185px] w-full bg-cover bg-center rounded-[10px]"

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

                    </div>
                </div>

            </div>
        </div>
    );
};

export default CardPreview;