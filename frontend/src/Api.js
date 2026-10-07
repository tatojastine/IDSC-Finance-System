const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getDashboardData() {
  try {
    const response = await fetch(`${API_URL}/dashboard`);

    if (!response.ok) {
      throw new Error("Unable to connect to API");
    }

    return await response.json();
  } catch (error) {
    console.warn("Using demo dashboard data:", error.message);

    return {
      statistics: {
        students: 1260,
        teachers: 224,
        parents: 840,
        earnings: 54000,
      },

      earnings: [
        { month: "Jan", earnings: 38000, expense: 46000 },
        { month: "Feb", earnings: 15000, expense: 28000 },
        { month: "Mar", earnings: 30000, expense: 38000 },
        { month: "Apr", earnings: 8000, expense: 51000 },
        { month: "May", earnings: 25000, expense: 30000 },
        { month: "Jun", earnings: 9000, expense: 12000 },
        { month: "Jul", earnings: 15000, expense: 18000 },
        { month: "Aug", earnings: 28000, expense: 35000 },
        { month: "Sep", earnings: 22000, expense: 44000 },
        { month: "Oct", earnings: 38000, expense: 12000 },
        { month: "Nov", earnings: 17000, expense: 21000 },
        { month: "Dec", earnings: 39000, expense: 27000 },
      ],

      studentsGender: {
        male: 55,
        female: 45,
      },

      notices: [
        {
          title: "Inter-school competition",
          description: "sports/singing/drawing/drama",
          date: "10 Feb, 2023",
          views: "7k",
        },
        {
          title: "Disciplinary action if school",
          description: "discipline is not followed",
          date: "6 Feb, 2023",
          views: "7k",
        },
        {
          title: "Parent-teacher meeting",
          description: "Monthly academic consultation",
          date: "3 Feb, 2023",
          views: "5k",
        },
      ],
    };
  }
}