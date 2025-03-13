import React, { useState } from "react";
import styled from "styled-components";

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #007bff;
  color: white;
  padding: 0.8rem;
  text-align: left;
`;

const Td = styled.td`
  padding: 0.8rem;
  border: 1px solid #ddd;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
`;

// Fake Data
const fakeData = [
    {
        project: "Building A",
        total: 50000,
        categories: [
            {
                category: "Foundation Work",
                total: 30000,
                jobs: [
                    {
                        job: "Digging and Reinforcement",
                        total: 15000,
                        details: [
                            { description: "Digging", amount: 10000 },
                            { description: "Reinforcement", amount: 5000 },
                        ],
                    },
                    {
                        job: "Roofing",
                        total: 15000,
                        details: [
                            { description: "Metal sheets", amount: 8000 },
                            { description: "Wood framework", amount: 7000 },
                        ],
                    },
                ],
            },
        ],
    },
    {
        project: "Building B",
        total: 20000,
        categories: [
            {
                category: "Painting",
                total: 10000,
                jobs: [
                    {
                        job: "Painting Work",
                        total: 6000,
                        details: [
                            { description: "Interior-1", amount: 1000 },
                            { description: "Interior-2", amount: 5000 },
                        ],
                    },
                    {
                        job: "Painting Work",
                        total: 4000,
                        details: [
                            { description: "Exterior", amount: 4000 },
                        ],
                    },
                ],
            },
        ],
    },
];

const LedgerCategory = () => {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});
    const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});


    const toggleExpand = (
        id: string,
        setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
        state: Record<string, boolean>
    ) => {
        setState(prevState => ({ ...prevState, [id]: !prevState[id] }));
    };


    return (
        <Container>
            <Table>
                <thead>
                    <tr>
                        <Th>Projects</Th>
                        <Th>Total</Th>
                    </tr>
                </thead>
                <tbody>
                    {fakeData.map((proj, i) => (
                        <React.Fragment key={i}>
                            <tr>
                                <Td>
                                    <ExpandButton onClick={() => toggleExpand(i.toString(), setExpandedProjects, expandedProjects)}>
                                        {expandedProjects[i] ? "-" : "+"}
                                    </ExpandButton>
                                    {proj.project}
                                </Td>
                                <Td>${proj.total}</Td>
                            </tr>
                            {expandedProjects[i] &&
                                proj.categories.map((cat, j) => (
                                    <React.Fragment key={`${i}-${j}`}>
                                        <tr>
                                            <Td style={{ paddingLeft: "2rem" }}>
                                                <ExpandButton onClick={() => toggleExpand(`${i}-${j}`, setExpandedCategories, expandedCategories)}>
                                                    {expandedCategories[`${i}-${j}`] ? "-" : "+"}
                                                </ExpandButton>
                                                {cat.category}
                                            </Td>
                                            <Td>${cat.total}</Td>
                                        </tr>
                                        {expandedCategories[`${i}-${j}`] &&
                                            cat.jobs.map((job, k) => (
                                                <React.Fragment key={`${i}-${j}-${k}`}>
                                                    <tr>
                                                        <Td style={{ paddingLeft: "4rem" }}>
                                                            <ExpandButton onClick={() => toggleExpand(`${i}-${j}-${k}`, setExpandedJobs, expandedJobs)}>
                                                                {expandedJobs[`${i}-${j}-${k}`] ? "-" : "+"}
                                                            </ExpandButton>
                                                            {job.job}
                                                        </Td>
                                                        <Td>${job.total}</Td>
                                                    </tr>
                                                    {expandedJobs[`${i}-${j}-${k}`] &&
                                                        job.details.map((detail, l) => (
                                                            <tr key={`${i}-${j}-${k}-${l}`} style={{ color: "blue" }}>
                                                                <Td style={{ paddingLeft: "6rem" }}>{detail.description}</Td>
                                                                <Td>${detail.amount}</Td>
                                                            </tr>
                                                        ))}
                                                </React.Fragment>
                                            ))}
                                    </React.Fragment>
                                ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default LedgerCategory;
