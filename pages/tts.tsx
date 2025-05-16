// src/pages/TTS.tsx

import React, {
  Suspense,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import {
  Box,
  Flex,
  Heading,
  Text,
  Textarea,
  Button,
  Spinner,
  useToast,
  VStack,
  Image,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TextProps,
  HStack,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaVolumeUp,
  FaLanguage,
  FaExclamationTriangle,
  FaMicrophone,
  FaStopCircle,
} from "react-icons/fa";

// Hằng số
const NGROK_URL = "https://943a-35-231-167-140.ngrok-free.app"; // Thay bằng URL ngrok của bạn
const SYNTH_ENDPOINT = "/synthesize";
const TRANSLATE_API_URL = "https://api.mymemory.translated.net/get";

interface TranslationResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  responseStatus: number;
  responseDetails?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SectionTitle: React.FC<
  TextProps & { icon?: React.ElementType; title: string }
> = ({ icon, title, ...props }) => (
  <Flex align="center" justify="center" my={8}>
    <Divider borderColor="gray.300" flex="1" />
    <Heading
      as="h2"
      size="lg"
      px={6}
      color="teal.600"
      whiteSpace="nowrap"
      {...props}
    >
      {icon && <Icon as={icon} mr={3} />}
      {title}
    </Heading>
    <Divider borderColor="gray.300" flex="1" />
  </Flex>
);

const TTS: React.FC = () => {
  const [vietnameseText, setVietnameseText] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);

  const [englishText, setEnglishText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any | null>(
    null
  );
  const [speechRecognitionError, setSpeechRecognitionError] = useState<
    string | null
  >(null);
  const [isSpeechApiSupported, setIsSpeechApiSupported] =
    useState<boolean>(true);

  const toast = useToast();
  const englishTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSpeechApiSupported(false);
      const errorMsg =
        "Trình duyệt không hỗ trợ Speech Recognition API. Tính năng thu âm giọng nói sẽ không hoạt động.";
      setSpeechRecognitionError(errorMsg);
      toast({
        title: "Không Tương Thích",
        description: errorMsg,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top-right",
      });
    } else if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setIsSpeechApiSupported(false);
      const errorMsg =
        "Trình duyệt không hỗ trợ API truy cập thiết bị Media (getUserMedia). Thu âm sẽ không hoạt động.";
      setSpeechRecognitionError(errorMsg);
      toast({
        title: "Không Tương Thích",
        description: errorMsg,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top-right",
      });
    }
  }, [toast]);

  const resetSynthesisState = () => {
    setAudioUrl(null);
    setSynthesisError(null);
  };

  const resetTranslationAndSynthesisState = () => {
    setTranslatedText(null);
    setTranslationError(null);
    resetSynthesisState();
  };

  const handleVietnameseTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setVietnameseText(event.target.value);
    if (synthesisError) setSynthesisError(null);
    if (audioUrl) setAudioUrl(null);
  };

  const handleEnglishTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEnglishText(event.target.value);
    resetTranslationAndSynthesisState();
  };

  const synthesizeSpeech = useCallback(
    async (textToSynthesize: string) => {
      if (!textToSynthesize.trim()) {
        toast({
          title: "Văn bản không được để trống",
          description: "Vui lòng nhập nội dung.",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
        return;
      }
      setIsSynthesizing(true);
      resetSynthesisState();
      try {
        const response = await fetch(`${NGROK_URL}${SYNTH_ENDPOINT}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Bypass-Tunnel-Reminder": "true",
          },
          body: JSON.stringify({ text: textToSynthesize }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage =
            errorData?.detail ||
            `Yêu cầu TTS thất bại với mã ${response.status}`;
          throw new Error(errorMessage);
        }
        const blob = await response.blob();
        if (!blob.type.startsWith("audio/")) {
          const errorText = await blob.text();
          if (errorText.includes("ngrok-error-page")) {
            throw new Error(
              "Lỗi kết nối đến Ngrok TTS. Kiểm tra URL và Ngrok. Bạn có thể cần header 'Bypass-Tunnel-Reminder'."
            );
          }
          throw new Error(
            `Định dạng audio không mong muốn: ${
              blob.type
            }. Chi tiết: ${errorText.substring(0, 100)}`
          );
        }
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        toast({
          title: "Tạo giọng nói thành công!",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      } catch (err: any) {
        setSynthesisError(err.message || "Lỗi tổng hợp giọng nói.");
        toast({
          title: "Lỗi khi tạo giọng nói",
          description: err.message,
          status: "error",
          duration: 7000,
          isClosable: true,
          position: "top-right",
        });
      } finally {
        setIsSynthesizing(false);
      }
    },
    [toast]
  );

  const handleCreateVietnameseSpeech = () => {
    synthesizeSpeech(vietnameseText);
  };

  const handleTranslateAndSynthesize = useCallback(async () => {
    if (!englishText.trim()) {
      toast({
        title: "Văn bản tiếng Anh không được để trống",
        status: "warning",
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    setIsTranslating(true);
    resetTranslationAndSynthesisState();
    try {
      const translateUrl = `${TRANSLATE_API_URL}?q=${encodeURIComponent(
        englishText
      )}&langpair=en|vi`;
      const transResponse = await fetch(translateUrl);
      if (!transResponse.ok)
        throw new Error(`API Dịch thuật trả về mã ${transResponse.status}`);
      const transData: TranslationResponse = await transResponse.json();
      if (
        transData.responseStatus !== 200 ||
        !transData.responseData?.translatedText
      ) {
        throw new Error(transData.responseDetails || "Không thể dịch văn bản.");
      }
      const vietnameseResult = transData.responseData.translatedText;
      setTranslatedText(vietnameseResult);
      toast({
        title: "Dịch thành công!",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
      setTimeout(() => synthesizeSpeech(vietnameseResult), 500);
    } catch (err: any) {
      setTranslationError(err.message || "Lỗi dịch thuật.");
      toast({
        title: "Lỗi Dịch Thuật",
        description: err.message,
        status: "error",
        duration: 7000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsTranslating(false);
    }
  }, [englishText, toast, synthesizeSpeech]);

  const handleToggleRecording = async () => {
    if (!isSpeechApiSupported) {
      const errorMsg =
        speechRecognitionError ||
        "API Nhận dạng Giọng nói không được hỗ trợ trên trình duyệt này.";
      toast({
        title: "Tính năng không được hỗ trợ",
        description: errorMsg,
        status: "error",
        isClosable: true,
      });
      return;
    }

    if (isRecording && recognitionInstance) {
      recognitionInstance.stop();
      console.log("Speech recognition stopped by user.");
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
      } catch (permError: any) {
        console.error(
          "Permission error before starting SpeechRecognition:",
          permError
        );
        let permErrorMessage =
          "Quyền truy cập microphone bị từ chối hoặc không thể truy cập.";
        if (
          permError.name === "NotAllowedError" ||
          permError.name === "PermissionDeniedError"
        ) {
          permErrorMessage =
            "Bạn đã từ chối quyền truy cập microphone. Vui lòng cấp quyền trong cài đặt trình duyệt.";
        } else if (
          permError.name === "NotFoundError" ||
          permError.name === "DevicesNotFoundError"
        ) {
          permErrorMessage =
            "Không tìm thấy microphone. Vui lòng kiểm tra thiết bị của bạn.";
        }
        setSpeechRecognitionError(permErrorMessage);
        toast({
          title: "Lỗi Quyền Microphone",
          description: permErrorMessage,
          status: "error",
          duration: 7000,
          isClosable: true,
        });
        return;
      }

      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();

      // **THAY ĐỔI QUAN TRỌNG:**
      // Sử dụng 'en' (Tiếng Anh chung) thay vì 'en-US' để tăng khả năng tương thích.
      // Nếu lỗi "language-not-supported" vẫn xảy ra với 'en',
      // vấn đề có thể nằm ở việc trình duyệt/OS thiếu gói ngôn ngữ Tiếng Anh cơ bản.
      recognition.lang = "en";
      recognition.interimResults = true;
      recognition.continuous = true;

      // Lấy giá trị hiện tại từ textarea (qua ref nếu có, hoặc state) để nối tiếp
      // Dùng ref để đảm bảo lấy giá trị mới nhất nếu người dùng gõ vào rồi mới bấm thu âm
      let currentSessionTranscript =
        englishTextareaRef.current?.value || englishText || "";

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechRecognitionError(null);
        toast({
          title: `Bắt đầu thu âm (${recognition.lang})...`,
          description: "Nói vào microphone.",
          status: "info",
          duration: 3000,
        });
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscriptSegment = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptSegment += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscriptSegment) {
          // Nối vào transcript của session hiện tại, đảm bảo có khoảng trắng nếu cần
          if (
            currentSessionTranscript === "" ||
            currentSessionTranscript.endsWith(" ")
          ) {
            currentSessionTranscript += finalTranscriptSegment;
          } else {
            currentSessionTranscript += " " + finalTranscriptSegment;
          }
        }
        // Cập nhật state englishText với transcript đầy đủ (final của session + interim hiện tại)
        setEnglishText(currentSessionTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error(
          `SpeechRecognition Error Event (lang: ${recognition.lang}):`,
          event
        );
        let errorMessage = `Lỗi không xác định. Mã lỗi: ${
          event.error || "N/A"
        }`;

        if (event.error === "no-speech") {
          errorMessage = "Không phát hiện giọng nói. Vui lòng thử lại.";
        } else if (event.error === "audio-capture") {
          errorMessage =
            "Lỗi thu âm thanh. Kiểm tra microphone hoặc quyền truy cập.";
        } else if (event.error === "not-allowed") {
          errorMessage =
            "Quyền truy cập microphone bị từ chối. Vui lòng kiểm tra cài đặt trình duyệt.";
        } else if (event.error === "network") {
          errorMessage =
            "Lỗi mạng trong quá trình nhận dạng giọng nói. Kiểm tra kết nối internet của bạn.";
        } else if (event.error === "service-not-allowed") {
          errorMessage =
            "Dịch vụ nhận dạng giọng nói bị từ chối hoặc không khả dụng trên trình duyệt này.";
        } else if (event.error === "bad-grammar") {
          errorMessage = "Lỗi cú pháp trong cấu hình nhận dạng (Bad grammar).";
        } else if (event.error === "language-not-supported") {
          errorMessage = `Ngôn ngữ Anh ('${recognition.lang}') không được hỗ trợ cho việc thu âm trên trình duyệt này. Vui lòng kiểm tra cài đặt ngôn ngữ của trình duyệt/hệ điều hành hoặc thử trình duyệt khác (ví dụ: Google Chrome).`;
        }

        setSpeechRecognitionError(errorMessage);
        toast({
          title: "Lỗi Thu Âm",
          description: errorMessage,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        setIsRecording(false);
        if (recognitionInstance) {
          recognitionInstance.stop(); // Đảm bảo dừng instance hiện tại nếu có lỗi
          setRecognitionInstance(null);
        } else if (recognition) {
          // Nếu instance chưa kịp set vào state nhưng đã tạo
          recognition.stop();
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setRecognitionInstance(null);
        setEnglishText((prev) => prev.trim()); // Trim khoảng trắng thừa khi kết thúc
        console.log("Speech recognition ended.");
      };

      setRecognitionInstance(recognition); // Lưu instance vào state
      try {
        recognition.start();
      } catch (e: any) {
        setIsRecording(false);
        setRecognitionInstance(null); // Đảm bảo dọn dẹp instance
        const startErrorMsg =
          "Không thể bắt đầu nhận dạng giọng nói. " + e.message;
        setSpeechRecognitionError(startErrorMsg);
        toast({
          title: "Lỗi Khởi Tạo Thu Âm",
          description: startErrorMsg,
          status: "error",
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionInstance) {
        recognitionInstance.abort();
        setRecognitionInstance(null);
      }
    };
  }, [recognitionInstance]);

  const BannerSection: React.FC = () => (
    <Flex
      direction={{ base: "column", md: "row" }}
      align="center"
      justify="center"
      p={{ base: 4, md: 8 }}
      mb={10}
      bg="gray.50"
      borderRadius="lg"
      boxShadow="md"
    >
      <Image
        src="../../image/speak2.png"
        alt="TTS Banner - Online Eye Examinations"
        boxSize={{ base: "250px", md: "350px" }}
        objectFit="contain"
        mr={{ md: 8 }}
        mb={{ base: 4, md: 0 }}
      />
      <Box flex="1" textAlign={{ base: "center", md: "left" }}>
        <Heading as="h1" size="xl" color="blue.600" mb={4}>
          ONLINE EYE EXAMINATIONS
        </Heading>
        <Text fontSize="md" color="gray.700" mb={3}>
          Vision assessment has been slower to adopt tele-health compared to
          other healthcare sectors due to the need for specialized equipment and
          the difficulty of replicating comprehensive exams remotely.
        </Text>
        <Text fontSize="md" color="gray.700" mb={4}>
          However, online services for vision screening and preliminary
          diagnoses are now available, enhancing convenience and safety for both
          patients and providers.
        </Text>
        <Text fontSize="sm" color="orange.500" fontStyle="italic">
          <strong>Disclaimer:</strong> We evaluate the companies independently,
          but may receive referral fees on the services featured.
        </Text>
      </Box>
    </Flex>
  );

  const FunctionalArea: React.FC<{
    title: string;
    icon?: React.ElementType;
    placeholder: string;
    textValue: string;
    onTextChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    buttonText: string;
    onButtonClick: () => void;
    isProcessing: boolean;
    processingText: string;
    errorState: string | null;
    onErrorClose: () => void;
    children?: React.ReactNode;
    showRecordButton?: boolean;
    isRecording?: boolean;
    onRecordToggle?: () => void;
    isSpeechApiSupported?: boolean;
    speechRecognitionErrorProp?: string | null;
    onCloseSpeechError?: () => void;
    textareaRef?: React.RefObject<HTMLTextAreaElement>;
  }> = ({
    title,
    icon,
    placeholder,
    textValue,
    onTextChange,
    buttonText,
    onButtonClick,
    isProcessing,
    processingText,
    errorState,
    onErrorClose,
    children,
    showRecordButton,
    isRecording: isRec,
    onRecordToggle,
    isSpeechApiSupported: isSpeechSupported,
    speechRecognitionErrorProp,
    onCloseSpeechError,
    textareaRef,
  }) => (
    <Box
      borderWidth="2px"
      borderStyle="dashed"
      borderColor="gray.300"
      borderRadius="xl"
      p={{ base: 4, md: 8 }}
      boxShadow="lg"
      bg="white"
      width="100%"
    >
      <VStack spacing={6}>
        <Heading size="md" color="gray.700" textAlign="center">
          {icon && <Icon as={icon} mr={2} verticalAlign="middle" />}
          {title}
        </Heading>
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={textValue}
          onChange={onTextChange}
          rows={6}
          size="lg"
          borderColor="blue.300"
          focusBorderColor="blue.500"
          _hover={{ borderColor: "blue.400" }}
          isDisabled={isProcessing || isSynthesizing || isRec}
        />
        {showRecordButton && (
          <Tooltip
            label={
              !isSpeechSupported
                ? "Trình duyệt không hỗ trợ thu âm"
                : isRec
                ? "Dừng Thu Âm"
                : "Bắt đầu Thu Âm (Tiếng Anh)"
            }
            placement="top"
            isDisabled={isSpeechSupported}
          >
            <Button
              leftIcon={isRec ? <FaStopCircle /> : <FaMicrophone />}
              colorScheme={isRec ? "red" : "blue"}
              onClick={onRecordToggle}
              isDisabled={!isSpeechSupported || (isRec && !recognitionInstance)}
              width="full"
              mt={2}
            >
              {isRec ? "Đang Thu Âm..." : "Thu Âm Tiếng Anh"}
            </Button>
          </Tooltip>
        )}
        {speechRecognitionErrorProp && (
          <Alert status="error" borderRadius="md" mt={2}>
            <AlertIcon as={FaExclamationTriangle} />
            <Box flex="1">
              <AlertTitle>Lỗi Thu Âm!</AlertTitle>
              <AlertDescription display="block">
                {speechRecognitionErrorProp}
              </AlertDescription>
            </Box>
            {onCloseSpeechError && (
              <CloseButton
                onClick={onCloseSpeechError}
                position="absolute"
                right="8px"
                top="8px"
              />
            )}
          </Alert>
        )}
        {errorState && (
          <Alert status="error" borderRadius="md">
            <AlertIcon as={FaExclamationTriangle} />
            <Box flex="1">
              <AlertTitle>Lỗi!</AlertTitle>
              <AlertDescription display="block">{errorState}</AlertDescription>
            </Box>
            <CloseButton
              onClick={onErrorClose}
              position="absolute"
              right="8px"
              top="8px"
            />
          </Alert>
        )}
        {children}
        <Button
          colorScheme="teal"
          onClick={onButtonClick}
          isLoading={isProcessing}
          loadingText={processingText}
          spinnerPlacement="start"
          size="lg"
          width="full"
          leftIcon={
            isProcessing ? undefined : icon ? <Icon as={icon} /> : undefined
          }
          _hover={{ bg: "teal.600" }}
          isDisabled={
            isProcessing || isSynthesizing || !textValue.trim() || isRec
          }
        >
          {buttonText}
        </Button>
        {(isProcessing || (isSynthesizing && audioUrl === null && !isRec)) && (
          <Flex justify="center" align="center" direction="column" mt={4}>
            <Spinner size="xl" color="teal.500" thickness="4px" />
            <Text mt={3} color="gray.600">
              {isProcessing ? processingText : "Đang tạo giọng nói..."}
            </Text>
          </Flex>
        )}
        {audioUrl && !isSynthesizing && (
          <Box
            mt={4}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            borderColor="gray.200"
            width="100%"
            bg="gray.50"
          >
            <Text
              mb={2}
              fontWeight="semibold"
              color="gray.700"
              textAlign="center"
            >
              Phát âm thanh:
            </Text>
            <audio controls src={audioUrl} style={{ width: "100%" }}>
              Trình duyệt của bạn không hỗ trợ phát âm thanh.
            </audio>
          </Box>
        )}
        {synthesisError && !isSynthesizing && (
          <Alert status="error" borderRadius="md" mt={4}>
            <AlertIcon as={FaExclamationTriangle} />
            <AlertTitle>Lỗi Tổng Hợp Giọng Nói!</AlertTitle>
            <AlertDescription>{synthesisError}</AlertDescription>
          </Alert>
        )}
      </VStack>
    </Box>
  );

  return (
    <>
      <NavBar />
      <Box as="main" minHeight="calc(100vh - 120px)">
        <Suspense
          fallback={
            <Flex justify="center" align="center" height="calc(100vh - 120px)">
              <Spinner size="xl" color="blue.500" />
              <Text ml={4} fontSize="lg">
                Đang tải trang...
              </Text>
            </Flex>
          }
        >
          <VStack
            spacing={10}
            py={{ base: 6, md: 10 }}
            px={{ base: 4, md: 6 }}
            align="stretch"
          >
            <BannerSection />
            <Tabs
              isFitted
              variant="enclosed-colored"
              colorScheme="teal"
              defaultIndex={0}
            >
              <TabList mb="1em">
                <Tab _selected={{ color: "white", bg: "teal.500" }}>
                  <Icon as={FaVolumeUp} mr={2} /> Chuyển Giọng Nói (Tiếng Việt)
                </Tab>
                <Tab _selected={{ color: "white", bg: "teal.500" }}>
                  <Icon as={FaLanguage} mr={2} /> Dịch Anh-Việt & Tạo Giọng Nói
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <SectionTitle
                    title="Chuyển Văn Bản Tiếng Việt Thành Giọng Nói"
                    icon={FaVolumeUp}
                  />
                  <FunctionalArea
                    title="Nhập văn bản Tiếng Việt"
                    placeholder="Nhập đoạn văn bản tiếng Việt bạn muốn chuyển đổi..."
                    textValue={vietnameseText}
                    onTextChange={handleVietnameseTextChange}
                    buttonText="Tạo Giọng Nói Tiếng Việt"
                    onButtonClick={handleCreateVietnameseSpeech}
                    isProcessing={isSynthesizing && audioUrl === null}
                    processingText="Đang tạo giọng nói..."
                    errorState={synthesisError}
                    onErrorClose={() => setSynthesisError(null)}
                  />
                </TabPanel>
                <TabPanel>
                  <SectionTitle
                    title="Dịch Tiếng Anh Sang Tiếng Việt & Tạo Giọng Nói"
                    icon={FaLanguage}
                  />
                  <FunctionalArea
                    title="Nhập hoặc Thu Âm văn bản Tiếng Anh"
                    textareaRef={englishTextareaRef}
                    placeholder="Enter English text or use microphone to record..."
                    textValue={englishText}
                    onTextChange={handleEnglishTextChange}
                    buttonText="Dịch & Tạo Giọng Nói"
                    onButtonClick={handleTranslateAndSynthesize}
                    isProcessing={isTranslating}
                    processingText="Đang dịch thuật..."
                    errorState={translationError}
                    onErrorClose={() => setTranslationError(null)}
                    showRecordButton={true}
                    isRecording={isRecording}
                    onRecordToggle={handleToggleRecording}
                    isSpeechApiSupported={isSpeechApiSupported}
                    speechRecognitionErrorProp={speechRecognitionError}
                    onCloseSpeechError={() => setSpeechRecognitionError(null)}
                  >
                    {translatedText && !isTranslating && (
                      <Box
                        width="100%"
                        p={3}
                        bg="gray.100"
                        borderRadius="md"
                        mt={4}
                      >
                        <Text fontWeight="semibold" mb={1} color="gray.600">
                          Văn bản đã dịch (Tiếng Việt):
                        </Text>
                        <Text color="gray.800">{translatedText}</Text>
                      </Box>
                    )}
                  </FunctionalArea>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Suspense>
      </Box>
      <Footer />
    </>
  );
};

export default TTS;
