namespace BBFF_EAFC_Career.ApiCode.DTO
{
    public class PlayerDto
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string Pos { get; set; }
        public string ImagePath { get; set; }
        public List<int> Caps { get; set; }
        public List<int> Goals { get; set; }
        public List<int> InternationalCaps { get; set; }
        public List<int> InternationalGoals { get; set; }
        public int TotalCaps { get; set; }
        public int TotalGoals { get; set; }
        public int TotalInternationalCaps { get; set; }
        public int TotalInternationalGoals { get; set; }
    }
}
