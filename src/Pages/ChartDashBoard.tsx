import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button, Card, Typography, Box, Stack, useMediaQuery } from "@mui/material";
import { getProjectData, getJobDataByProject,getPayeeData, getAllProjectCodes } from "../services/SharedServices";


  
export default function ChartDashboard() {
  const [chartType, setChartType] = useState("project");
  const [selectedProject, setSelectedProject] = useState({
    "code": 4,
    "project_name": "Plaza NewTown"
});
  const [projList, setProjList] = useState([

    {
        "code": 0,
        "project_name": ""
    }
]);
  const [projData, setProjData] = useState([
    { name: "Job A", invoiced: 20000, paid: 18000 },
    { name: "Job B", invoiced: 35000, paid: 32000 },
  ]);
  const isMobile = useMediaQuery("(max-width:1000px)");

  useEffect(() => {
    const fetchData = async () => {
      if (chartType === "project") {
        setProjData(await getProjectData());
      } else if (chartType.startsWith("project-job")) {
        setProjData(await getJobDataByProject(selectedProject.code));
      } else {
        setProjData(await getPayeeData());
      }
      setProjList(await getAllProjectCodes());
    };

    fetchData();
    
  }, [chartType, selectedProject]);

 
  return (
    <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 3, p: 3 }}>
      {/* Buttons Panel */}
      <Card sx={{ p: 2, textAlign: "center", width: isMobile ? "100%" : "250px" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Project Payment Status</Typography>
        <Stack direction={isMobile ? "row" : "column"} spacing={1} justifyContent="center">
          <Button variant={chartType === "project" ? "contained" : "outlined"} onClick={() => setChartType("project")}>
            Project
          </Button>
          <Button variant={chartType === "payee" ? "contained" : "outlined"} onClick={() => setChartType("payee")}>
            Payee
          </Button>
        </Stack>

        <Box sx={{ p: 1 }}></Box>

        <Typography variant="h6" sx={{ mb: 2 }}>Project Jobs Status</Typography>
        <Stack direction={isMobile ? "row" : "column"} spacing={1} justifyContent="center">
          {projList.map((proj) => (
            <Button
              key={proj.project_name}
              variant={chartType === proj.project_name ? "contained" : "outlined"}
              onClick={() => {setChartType(proj.code.toString()); setSelectedProject(proj);setChartType("project-job-"+proj.code.toString())}}
            >
              {proj.project_name}
            </Button>
          ))}
        </Stack>
      </Card>

      {/* Chart Panel */}
      <Card sx={{ p: 2, flex: 1 }}>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
        {chartType === "project"
          ? "Project Invoiced vs Paid"
          : chartType === "payee"
          ? "Payee Invoiced vs Paid"
          : `Invoiced vs Paid for Project: ${selectedProject?.project_name || chartType}`}
      </Typography>
       
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={projData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="invoiced" fill="#8884d8" name="Invoiced" />
            <Bar dataKey="paid" fill="#82ca9d" name="Paid" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
}
