import { cn } from "@/lib/utils";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutList, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import EndCallButton from "./EndCallButton";
import Loader from "./Loader";
import { SFNClient, DescribeExecutionCommand } from "@aws-sdk/client-sfn";

// AWS IAM Config
const stepfunctionsClient = new SFNClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");
  const [layout, setlayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setshowParticipants] = useState(false);
  const router = useRouter();

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [poseURL, setPoseURL] = useState("");
  const [signURL, setSignURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [skippedFiles, setSkippedFiles] = useState<string[]>([]);

  const call = useCall();

  const callGlossToPoseAPI = async (glossText: string) => {
    try {
      setIsLoading(true);

      const res = await fetch(
        "https://qxm4146qi4.execute-api.us-east-1.amazonaws.com/Prod",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Text: glossText }),
        }
      );

      const data = await res.json();
      const executionArn = data.executionArn;
      if (!executionArn) throw new Error("No executionArn returned");

      let result;
      while (true) {
        const command = new DescribeExecutionCommand({ executionArn });
        const desc = await stepfunctionsClient.send(command);

        if (desc.status === "SUCCEEDED") {
          result = JSON.parse(desc.output!);
          break;
        }

        if (desc.status === "FAILED" || desc.status === "TIMED_OUT") {
          throw new Error("Step Function failed: " + desc.status);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      setPoseURL(result.PoseURL);
      setSignURL(result.SignURL);
      setSkippedFiles(result.Skipped || []);

      console.log("📤 Sending custom event with:", {
        poseURL: result.PoseURL,
        signURL: result.SignURL,
      });

      if (call) {
        (call as any)?.sendCustomEvent?.({
          type: "signVideoUpdate",
          data: {
            poseURL: result.PoseURL,
            signURL: result.SignURL,
          },
        });
      }
    } catch (error) {
      console.error("Error in callGlossToPoseAPI:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
        setPoseURL("");
        setSignURL("");
      };

      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        callGlossToPoseAPI(result);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      (window as any).recognition = recognition;
    }
  }, []);

  useEffect(() => {
    if (!call || !call.state) return;

    const interval = setInterval(() => {
      const customData = (call.state as any)?.customData;

      if (customData?.poseURL && customData.poseURL !== poseURL) {
        setPoseURL(customData.poseURL);
      }

      if (customData?.signURL && customData.signURL !== signURL) {
        setSignURL(customData.signURL);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [call, poseURL, signURL]);

  useEffect(() => {
    if (!call) return;

    const handleSignVideoUpdate = (event: any) => {
      if (event.custom?.type === "signVideoUpdate") {
        console.log("📥 Received signVideoUpdate event:", event);

        const poseURL = event.custom.data?.poseURL;
        const signURL = event.custom.data?.signURL;

        if (poseURL) {
          console.log("🎥 Setting poseURL:", poseURL);
          setPoseURL(poseURL);
        }

        if (signURL) {
          console.log("🎥 Setting signURL:", signURL);
          setSignURL(signURL);
        }
      }
    };

    (call as any).on("custom", handleSignVideoUpdate);

    return () => {
      (call as any).off("custom", handleSignVideoUpdate);
    };
  }, [call]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn("h-[calc(100vh-86px)] ml-2", {
            hidden: !showParticipants,
            block: showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setshowParticipants(false)} />
        </div>
      </div>

      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap">
        <CallControls onLeave={() => router.push("/")} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232D] px-4 py-2 hover:bg-[#4C535B]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-[var(--dark-1)] bg-[var(--dark-1)] text-white">
            {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
              <DropdownMenuItem
                key={index}
                className="cursor-pointer"
                onClick={() => setlayout(item.toLowerCase() as CallLayoutType)}
              >
                {item}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />
        <button
          onClick={() => setshowParticipants((prev) => !prev)}
          className="rounded-2xl bg-[#19232D] px-4 py-2 hover:bg-[#4C535B]"
        >
          <Users size={20} className="text-white" />
        </button>
        <button
          onClick={() => {
            if ((window as any).recognition) {
              if (isListening) {
                (window as any).recognition.stop();
              } else {
                (window as any).recognition.start();
              }
            }
          }}
          className="rounded-2xl bg-[#19232D] px-4 py-2 hover:bg-[#4C535B] text-white"
        >
          {isListening ? "Stop Listening" : "Start Listening"}
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>

      <div className="fixed bottom-28 right-5 z-50 max-w-[300px] bg-[#111] p-4 rounded-lg shadow-lg">
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-white" />
          </div>
        ) : (
          <>
            {poseURL && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-semibold">Pose Animation</p>
                <video src={poseURL} controls className="rounded-md" />
              </div>
            )}
            {signURL && (
              <div>
                <p className="mb-2 text-sm font-semibold">Sign Animation</p>
                <video src={signURL} controls className="rounded-md" />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default MeetingRoom;
