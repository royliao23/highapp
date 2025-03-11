import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button, Card, CardContent, Typography, Box, Stack } from "@mui/material";

const projectData = [
  { name: "Project A", invoiced: 50000, paid: 40000 },
  { name: "Project B", invoiced: 70000, paid: 65000 },
  { name: "Project C", invoiced: 45000, paid: 42000 }
];

const payeeData = [
  { name: "Payee X", invoiced: 30000, paid: 25000 },
  { name: "Payee Y", invoiced: 60000, paid: 55000 },
  { name: "Payee Z", invoiced: 50000, paid: 49000 }
];

export default function ChartDashboard() {
  const [chartType, setChartType] = useState("project"); // Toggle between project/payee

  const data = chartType === "project" ? projectData : payeeData;

  return (
    <Box sx={{ display: "flex", gap: 3, p: 3 }}>
      {/* Left Panel (Buttons) */}
      <Card sx={{ p: 2, width: "250px", textAlign: "center", height: "fit-content" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Select View</Typography>
        <Stack spacing={1}>
          <Button 
            variant={chartType === "project" ? "contained" : "outlined"} 
            onClick={() => setChartType("project")}
          >
            Project Invoiced vs Paid
          </Button>
          <Button 
            variant={chartType === "payee" ? "contained" : "outlined"} 
            onClick={() => setChartType("payee")}
          >
            Payee Invoiced vs Paid
          </Button>
        </Stack>
      </Card>

      {/* Right Panel (Chart) */}
      <Card sx={{ p: 2, flex: 1 }}>
        <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
          {chartType === "project" ? "Project Invoiced vs Paid" : "Payee Invoiced vs Paid"}
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
      </Card>
    </Box>
  );
}
