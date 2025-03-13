import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button, Card, Typography, Box, Stack, useMediaQuery } from "@mui/material";
import { getProjectData, getJobDataByProject,getPayeeData } from "../services/SharedServices";

let projectData = [
  { name: "Project A", invoiced: 50000, paid: 40000 },
  { name: "Project B", invoiced: 70000, paid: 65000 },
  { name: "Project C", invoiced: 45000, paid: 42000 }
];

const payeeData = [
  { name: "Payee X", invoiced: 30000, paid: 25000 },
  { name: "Payee Y", invoiced: 60000, paid: 55000 },
  { name: "Payee Z", invoiced: 50000, paid: 49000 }
];

const projectJobData: Record<string, { name: string; invoiced: number; paid: number }[]> = {
    "project-job-x": [
      { name: "Job A", invoiced: 20000, paid: 18000 },
      { name: "Job B", invoiced: 35000, paid: 32000 },
    ],
    "project-job-y": [
      { name: "Job C", invoiced: 45000, paid: 40000 },

      { name: "Job D", invoiced: 30000, paid: 28000 },
    ],
    "project-job-z": [
      { name: "Job A", invoiced: 20000, paid: 18000 },
      { name: "Job E", invoiced: 50000, paid: 47000 },
      { name: "Job F", invoiced: 60000, paid: 58000 },
    ],
  };
  
export default function ChartDashboard() {
  const [chartType, setChartType] = useState("project");
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
        setProjData(await getJobDataByProject(1));
      } else {
        setProjData(await getPayeeData());
      }
    };

    fetchData();
  }, [chartType]);

  const data =
  chartType.startsWith("project-job") ? projectJobData[chartType] || [] :
  chartType === "project" ? projectData :
  payeeData;

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
          {["project-job-x", "project-job-y", "project-job-z"].map((jobType) => (
            <Button
              key={jobType}
              variant={chartType === jobType ? "contained" : "outlined"}
              onClick={() => setChartType(jobType)}
            >
              {jobType.replace("project-job-", "Project ")}
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
            : `Jobs for ${chartType.replace("project-job-", "Project ")}`}
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="invoiced" fill="#8884d8" name="Invoiced" />
            <Bar dataKey="paid" fill="#82ca9d" name="Paid" />
          </BarChart>
        </ResponsiveContainer>
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
