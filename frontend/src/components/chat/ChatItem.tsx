import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function extractCodeFromString(message: string) {
  if (message.includes("```")) {
    const blocks = message.split("```");
    return blocks.filter(block => block.trim() !== ""); // Filter out empty blocks
  }
  return [];
}

function isCodeBlock(str: string) {
  return /[=\[\]{}#;/]/.test(str) || str.includes("//");
}

const ChatItem = ({
  content,
  role,
}: {
  content: string;
  role: "user" | "assistant";
}) => {
  const messageBlocks = extractCodeFromString(content);
  const auth = useAuth();

  // Safely extract the initials from the user's name
  const userInitials = () => {
    if (auth?.user?.name) {
      const nameParts = auth.user.name.split(" ");
      return nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[1][0]}`
        : nameParts[0][0] || "U"; // Default to "U" if only one name part is available
    }
    return "U"; // Default to "U" if no name is available
  };

  return role === "assistant" ? (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d5612",
        gap: 2,
        borderRadius: 2,
        my: 1,
      }}
    >
      <Avatar sx={{ ml: "0" }}>
        <img src="openai.png" alt="openai" width={"30px"} />
      </Avatar>
      <Box>
        {messageBlocks.length === 0 ? (
          <Typography sx={{ fontSize: "20px" }}>{content}</Typography>
        ) : (
          messageBlocks.map((block, index) =>
            isCodeBlock(block) ? (
              <SyntaxHighlighter key={index} style={coldarkDark} language="javascript">
                {block}
              </SyntaxHighlighter>
            ) : (
              <Typography key={index} sx={{ fontSize: "20px" }}>{block}</Typography>
            )
          )
        )}
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d56",
        gap: 2,
        borderRadius: 2,
      }}
    >
      <Avatar sx={{ ml: "0", bgcolor: "black", color: "white" }}>
        {userInitials()}
      </Avatar>
      <Box>
        {messageBlocks.length === 0 ? (
          <Typography sx={{ fontSize: "20px" }}>{content}</Typography>
        ) : (
          messageBlocks.map((block, index) =>
            isCodeBlock(block) ? (
              <SyntaxHighlighter key={index} style={coldarkDark} language="javascript">
                {block}
              </SyntaxHighlighter>
            ) : (
              <Typography key={index} sx={{ fontSize: "20px" }}>{block}</Typography>
            )
          )
        )}
      </Box>
    </Box>
  );
};

export default ChatItem;
