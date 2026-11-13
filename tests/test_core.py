import unittest
from core import Puzzle


class RailTests(unittest.TestCase):
    def build(self):
        p = Puzzle(4, 2)
        for x in range(3):
            p.put((x, 0), "EW")
        return p

    def test_valid_route_arrives(self):
        p = self.build()
        result = p.run()
        self.assertEqual(result.status, "arrived")
        self.assertEqual(result.visited, ((0, 0), (1, 0), (2, 0)))

    def test_gap_stops_without_success(self):
        p = Puzzle(4, 2)
        p.put((0, 0), "EW")
        p.put((2, 0), "EW")
        self.assertEqual(p.run().reason, "missing rail")

    def test_incompatible_track_rejected_by_simulation(self):
        p = Puzzle(4, 2)
        p.put((0, 0), "EW")
        p.put((1, 0), "NS")
        self.assertEqual(p.run().reason, "incompatible connector")

    def test_reset_clears_all_rails(self):
        p = self.build()
        p.reset()
        self.assertEqual(p.rails, {})
        self.assertEqual(p.run().status, "blocked")

    def test_invalid_cells_and_rail_overwrite(self):
        p = self.build()
        with self.assertRaises(ValueError):
            p.put((0, 0), "NS")
        with self.assertRaises(ValueError):
            p.put((99, 0), "EW")
        with self.assertRaises(ValueError):
            p.put((0, 1), "ENW")


if __name__ == "__main__":
    unittest.main()
