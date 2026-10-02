namespace BBFF_EAFC_Career.ApiCode.DTO
{
    public class TransferLogDto
    {
        public int ID { get; set; }
        public int CareerID { get; set; }
        public int Year { get; set; }
        public DateTime RawDate { get; set; }
        public string Date { get; set; }
        public string Status { get; set; }
        public string Player { get; set; }
        public string PlayerImagePath { get; set; }
        public string FromClub { get; set; }
        public string ToClub { get; set; }
        public int Fee { get; set; }
        public string FeeDisplay { get; set; }
        public bool Loan { get; set; }
    }
}
