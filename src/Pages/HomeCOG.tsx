import React from "react";
import { Box, Typography, Container } from "@mui/material";

const EasterEvent = () => {
  return (
    <div className="homecog">
      <Box
        sx={{
          // backgroundImage: "linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url('/assets/easterimg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 5,
          px: 2,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            borderRadius: 4,
            padding: 4,
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0px 15px 35px rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(6px)",
            transform: "perspective(1000px) rotateX(1deg)",
          }}
        >
          {/* Top Header */}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: "#6A1B9A",
              textShadow: "2px 2px 6px rgba(0, 0, 0, 0.3)",
              mb: 1,
            }}
          >
            JAMES COOK TECHNOLOGY BOYS HIGH SCHOOL
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: "#43A047",
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.2)",
              mb: 5,
            }}
          >
            詹姆斯·库克男子科技学校
          </Typography>

          {/* Theme */}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: "#6A1B9A",
              textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
              mb: 1,
            }}
          >
            主题：共庆复活佳节
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              color: "#6A1B9A",
              fontStyle: "italic",
              fontSize: "1.1rem",
              textShadow: "0.5px 0.5px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            分享喜乐见证，同沐主恩典光。
          </Typography>

          

          {/* Time & Place */}
          <Typography variant="h5" sx={{ mb: 2, color: "#6A1B9A",
              fontStyle: "italic",}}>
            <strong>时间：</strong> 4月20日（周日）11:45am-12:45pm
          </Typography>
          <Typography variant="h5" sx={{ mb: 1, color: "#6A1B9A",
              fontStyle: "italic",}}>
            <strong>地点：</strong> 詹姆斯·库克男子科技学校图书馆
          </Typography>
          <Typography variant="h5" sx={{ mb: 1, color: "#6A1B9A",
              fontStyle: "italic",}}>
            <strong>（Address： 800 Princes Highway
            Kogarah NSW 2217）</strong>
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: "green",
              fontStyle: "italic",}}>
            <strong>费用：</strong> 免费
          </Typography>

          {/* Activities */}
          <Typography variant="h4"
            sx={{
              mb: 4,
              fontSize: "1.1rem",
              color: "#D84315",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
            }}
          >
            <strong>活动内容：</strong> 唱游 · 见证 · 复活节信息
          </Typography>
          

          {/* Bottom Note */}
          <Box 
            sx={{
              backgroundColor: "#FFF9C4",
              padding: 2,
              borderRadius: 2,
              mt: 3,
              boxShadow: "inset 0px 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#6D4C41",
                textShadow: "0.5px 0.5px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              会后备有丰盛午餐，欢迎携带食物共享
            </Typography>
          </Box>
        </Container>
      </Box>
    </div>
  );
};

export default EasterEvent;
